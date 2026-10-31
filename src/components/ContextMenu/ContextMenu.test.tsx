import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { DropdownDivider, DropdownItem } from '../Dropdown'

import { ContextMenu } from './ContextMenu'

// jsdom has no PointerEvent, so the events would lose their coordinates and pointer type
if (!(window as any).PointerEvent) {
  ;(window as any).PointerEvent = function PointerEvent(type: string, init: any = {}) {
    const event = new MouseEvent(type, init)
    Object.defineProperty(event, 'pointerId', { value: init.pointerId ?? 1 })
    Object.defineProperty(event, 'pointerType', { value: init.pointerType ?? 'mouse' })
    return event
  }
}

// Popper places the menu asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

const renderMenu = (props: { onRename?(): void; onOpenChange?(open: boolean): void; disabled?: boolean } = {}) =>
  render(
    <>
      <ContextMenu
        label='Actions for Contract.pdf'
        disabled={props.disabled}
        onOpenChange={props.onOpenChange}
        menu={
          <>
            <DropdownItem onClick={props.onRename}>Rename</DropdownItem>
            <DropdownItem disabled>Share</DropdownItem>
            <DropdownDivider />
            <DropdownItem type='danger'>Delete</DropdownItem>
          </>
        }
      >
        <div tabIndex={0}>Contract.pdf</div>
      </ContextMenu>
      <button>Other</button>
    </>
  )

describe('ContextMenu', () => {
  it('should render correctly when open', async () => {
    const { getByText } = renderMenu()
    fireEvent.contextMenu(getByText('Contract.pdf'), { clientX: 100, clientY: 50 })
    await flush()
    expect(document.body).toMatchSnapshot()
  })

  it('should open with a right click and focus the first item', async () => {
    const onOpenChange = jest.fn()
    const { getByText, getByRole, queryByRole } = renderMenu({ onOpenChange })
    expect(queryByRole('menu')).not.toBeInTheDocument()

    const event = fireEvent.contextMenu(getByText('Contract.pdf'), { clientX: 100, clientY: 50 })
    await flush()
    expect(event).toBe(false)
    expect(getByRole('menu')).toHaveAttribute('aria-label', 'Actions for Contract.pdf')
    expect(getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('should open with Shift + F10 and the context menu key', async () => {
    const { getByText, getByRole, queryByRole } = renderMenu()
    const target = getByText('Contract.pdf')
    expect(target).toHaveAttribute('aria-keyshortcuts', 'Shift+F10')

    target.focus()
    fireEvent.keyDown(target, { key: 'F10', shiftKey: true })
    await flush()
    expect(getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(queryByRole('menu')).not.toBeInTheDocument()
    expect(target).toHaveFocus()

    fireEvent.keyDown(target, { key: 'ContextMenu' })
    await flush()
    expect(getByRole('menu')).toBeInTheDocument()
  })

  it('should close and give the focus back when an item is chosen', async () => {
    const onRename = jest.fn()
    const onOpenChange = jest.fn()
    const { getByText, getByRole, queryByRole } = renderMenu({ onRename, onOpenChange })
    const target = getByText('Contract.pdf')

    target.focus()
    fireEvent.contextMenu(target, { clientX: 10, clientY: 10 })
    await flush()
    fireEvent.click(getByRole('menuitem', { name: 'Rename' }))

    expect(onRename).toHaveBeenCalledTimes(1)
    expect(queryByRole('menu')).not.toBeInTheDocument()
    expect(target).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('should stay open when a disabled item is clicked', async () => {
    const { getByText, getByRole } = renderMenu()
    fireEvent.contextMenu(getByText('Contract.pdf'), { clientX: 10, clientY: 10 })
    await flush()
    fireEvent.click(getByRole('menuitem', { name: 'Share' }))
    expect(getByRole('menu')).toBeInTheDocument()
  })

  it('should close with a press outside', async () => {
    const { getByText, getByRole, queryByRole } = renderMenu()
    fireEvent.contextMenu(getByText('Contract.pdf'), { clientX: 10, clientY: 10 })
    await flush()

    fireEvent.pointerDown(getByRole('button', { name: 'Other' }))
    expect(queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should close when the page scrolls', async () => {
    const { getByText, queryByRole } = renderMenu()
    fireEvent.contextMenu(getByText('Contract.pdf'), { clientX: 10, clientY: 10 })
    await flush()

    fireEvent.scroll(document)
    expect(queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should open with a long press on a touch screen', async () => {
    jest.useFakeTimers()
    const { getByText, getByRole, queryByRole } = renderMenu()
    const target = getByText('Contract.pdf')

    fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 20, clientY: 20 })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    fireEvent.pointerUp(target, { pointerType: 'touch' })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 20, clientY: 20 })
    fireEvent.pointerMove(target, { pointerType: 'touch', clientX: 20, clientY: 60 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 20, clientY: 20 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    await flush()
    expect(getByRole('menu')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('should keep the menu of the browser when disabled', async () => {
    const { getByText, queryByRole } = renderMenu({ disabled: true })
    const target = getByText('Contract.pdf')

    expect(fireEvent.contextMenu(target, { clientX: 10, clientY: 10 })).toBe(true)
    expect(queryByRole('menu')).not.toBeInTheDocument()
    expect(target).not.toHaveAttribute('aria-keyshortcuts')
  })

  it('should call the handlers of the child', async () => {
    const onContextMenu = jest.fn()
    const onKeyDown = jest.fn()
    const { getByText } = render(
      <ContextMenu menu={<DropdownItem>Copy</DropdownItem>}>
        <div tabIndex={0} onContextMenu={onContextMenu} onKeyDown={onKeyDown}>
          Text
        </div>
      </ContextMenu>
    )

    fireEvent.contextMenu(getByText('Text'))
    await flush()
    fireEvent.keyDown(getByText('Text'), { key: 'a' })
    expect(onContextMenu).toHaveBeenCalledTimes(1)
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })
})
