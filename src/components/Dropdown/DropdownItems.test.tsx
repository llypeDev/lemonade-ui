import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { Dropdown } from './Dropdown'
import { DropdownCheckboxItem } from './DropdownCheckboxItem'
import { DropdownGroup } from './DropdownGroup'
import { DropdownItem } from './DropdownItem'
import { DropdownMenu } from './DropdownMenu'
import { DropdownRadioGroup, DropdownRadioItem } from './DropdownRadioGroup'
import { DropdownSubmenu } from './DropdownSubmenu'

jest.mock('../../util/string')

// Popper places menus asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

const FileMenu = (props: { onClose?(): void; onMove?(folder: string): void }) => {
  const [anchor, setAnchor] = useState<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [sort, setSort] = useState('name')

  return (
    <>
      <button ref={setAnchor} onClick={() => setOpen(true)}>
        Actions
      </button>
      <Dropdown
        anchorRef={anchor}
        open={open}
        onClose={() => {
          setOpen(false)
          props.onClose && props.onClose()
        }}
      >
        <DropdownItem icon='copyOutline' shortcut={['Ctrl', 'C']}>
          Copy
        </DropdownItem>
        <DropdownSubmenu label='Move to' icon='folderOutline'>
          <DropdownItem onClick={() => props.onMove && props.onMove('Documents')}>Documents</DropdownItem>
          <DropdownItem onClick={() => props.onMove && props.onMove('Photos')}>Photos</DropdownItem>
        </DropdownSubmenu>
        <DropdownCheckboxItem checked={hidden} onCheckedChange={setHidden}>
          Show hidden files
        </DropdownCheckboxItem>
        <DropdownRadioGroup label='Sort by' value={sort} onValueChange={setSort}>
          <DropdownRadioItem value='name'>Name</DropdownRadioItem>
          <DropdownRadioItem value='date'>Date</DropdownRadioItem>
        </DropdownRadioGroup>
      </Dropdown>
    </>
  )
}

// The old accessible name library of the tests does not name menus by aria-label, so menus are found by it
const submenu = () => document.querySelector('[role="menu"][aria-label="Move to"]')
const copyItem = () =>
  Array.from(document.querySelectorAll('[role="menuitem"]')).find((item) => item.textContent === 'CopyCtrl+C')

const openMenu = async (getByRole: (role: string, options?: any) => HTMLElement) => {
  jest.useFakeTimers()
  fireEvent.click(getByRole('button', { name: 'Actions' }))
  act(() => {
    jest.runAllTimers()
  })
  jest.useRealTimers()
  await flush()
}

describe('Dropdown items', () => {
  it('should render correctly', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownItem icon='copyOutline' shortcut={['Ctrl', 'C']}>
          Copy
        </DropdownItem>
        <DropdownItem icon={null}>Paste</DropdownItem>
        <DropdownCheckboxItem checked>Show hidden files</DropdownCheckboxItem>
        <DropdownGroup label='Sort by'>
          <DropdownItem>Name</DropdownItem>
        </DropdownGroup>
      </DropdownMenu>
    )
    expect(container).toMatchSnapshot()
  })

  it('should keep plain items as they were', () => {
    const { getByRole } = render(
      <DropdownMenu>
        <DropdownItem>Plain</DropdownItem>
      </DropdownMenu>
    )
    expect(getByRole('menuitem', { name: 'Plain' }).children).toHaveLength(0)
  })

  it('should show an icon and a shortcut that is part of the name', () => {
    const { getByRole } = render(
      <DropdownMenu>
        <DropdownItem icon='copyOutline' shortcut={['Ctrl', 'C']}>
          Copy
        </DropdownItem>
      </DropdownMenu>
    )
    const item = getByRole('menuitem')
    expect(item.querySelector('svg')).toBeInTheDocument()
    expect(item).toHaveTextContent('CopyCtrl+C')
  })

  it('should turn a checkbox item on and off and keep the menu open', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(<FileMenu onClose={onClose} />)
    await openMenu(getByRole)

    const item = getByRole('menuitemcheckbox', { name: 'Show hidden files' })
    expect(item).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(item)
    expect(item).toHaveAttribute('aria-checked', 'true')
    fireEvent.keyDown(item, { key: ' ' })
    expect(item).toHaveAttribute('aria-checked', 'false')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should check one radio item of a group', async () => {
    const { getByRole } = render(<FileMenu />)
    await openMenu(getByRole)

    expect(getByRole('group', { name: 'Sort by' })).toBeInTheDocument()
    expect(getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(getByRole('menuitemradio', { name: 'Date' }))
    expect(getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute('aria-checked', 'true')
    expect(getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute('aria-checked', 'false')
  })

  it('should move through all kinds of items with the arrows, skipping the items of submenus', async () => {
    const { getByRole } = render(<FileMenu />)
    await openMenu(getByRole)
    const menu = getByRole('menu')

    expect(copyItem()).toHaveFocus()
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(getByRole('menuitem', { name: 'Move to' })).toHaveFocus()
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(getByRole('menuitemcheckbox')).toHaveFocus()
    fireEvent.keyDown(menu, { key: 'End' })
    expect(getByRole('menuitemradio', { name: 'Date' })).toHaveFocus()
    // The right arrow does not move between the items of a vertical menu
    fireEvent.keyDown(menu, { key: 'ArrowRight' })
    expect(getByRole('menuitemradio', { name: 'Date' })).toHaveFocus()
  })

  it('should open a submenu with the keyboard and close it with the left arrow', async () => {
    const { getByRole } = render(<FileMenu />)
    await openMenu(getByRole)
    const trigger = getByRole('menuitem', { name: 'Move to' })

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    await flush()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(getByRole('menuitem', { name: 'Documents' })).toHaveFocus()

    fireEvent.keyDown(submenu(), { key: 'ArrowDown' })
    expect(getByRole('menuitem', { name: 'Photos' })).toHaveFocus()

    fireEvent.keyDown(getByRole('menuitem', { name: 'Photos' }), { key: 'ArrowLeft' })
    expect(submenu()).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('should close only the submenu with Escape', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(<FileMenu onClose={onClose} />)
    await openMenu(getByRole)

    fireEvent.keyDown(getByRole('menuitem', { name: 'Move to' }), { key: 'Enter' })
    await flush()
    fireEvent.keyDown(getByRole('menuitem', { name: 'Documents' }), { key: 'Escape' })

    expect(submenu()).not.toBeInTheDocument()
    expect(getByRole('menu')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should open a submenu with the pointer and close the dropdown when one of its items is picked', async () => {
    const onMove = jest.fn()
    const onClose = jest.fn()
    const { getByRole } = render(<FileMenu onMove={onMove} onClose={onClose} />)
    await openMenu(getByRole)

    fireEvent.mouseEnter(getByRole('menuitem', { name: 'Move to' }).parentElement)
    await flush()
    expect(copyItem()).toHaveFocus()

    fireEvent.click(getByRole('menuitem', { name: 'Photos' }))
    expect(onMove).toHaveBeenCalledWith('Photos')
    expect(onClose).toHaveBeenCalled()
  })

  it('should not close the dropdown when the item that opens a submenu is clicked', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(<FileMenu onClose={onClose} />)
    await openMenu(getByRole)

    fireEvent.click(getByRole('menuitem', { name: 'Move to' }))
    await flush()
    expect(submenu()).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should not open a disabled submenu', () => {
    const { getByRole } = render(
      <DropdownMenu>
        <DropdownSubmenu label='Share' disabled>
          <DropdownItem>Email</DropdownItem>
        </DropdownSubmenu>
      </DropdownMenu>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Share' }))
    expect(document.querySelector('[aria-label="Share"]')).not.toBeInTheDocument()
  })
})
