import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { CommandItem, CommandPalette } from './CommandPalette'

jest.mock('../../util/string')

const makeItems = (onSelect = jest.fn()): CommandItem[] => [
  { id: 'orders', label: 'Orders', group: 'Pages', icon: 'shoppingCartOutline', onSelect },
  { id: 'customers', label: 'Customers', group: 'Pages', description: 'People who bought', onSelect },
  { id: 'new-order', label: 'New order', group: 'Actions', shortcut: ['Ctrl', 'N'], onSelect },
  { id: 'theme', label: 'Switch theme', group: 'Actions', keywords: ['dark', 'light'], onSelect },
  { id: 'export', label: 'Exportação', group: 'Actions', onSelect },
]

const Palette = (props: Partial<React.ComponentProps<typeof CommandPalette>>) => {
  const [open, setOpen] = useState(props.open ?? true)
  return <CommandPalette items={makeItems()} {...props} open={open} onOpenChange={setOpen} />
}

describe('CommandPalette', () => {
  it('should render correctly', () => {
    render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)
    expect(document.body.querySelector('[role="dialog"]')).toMatchSnapshot()
  })

  it('should be a dialog with a combobox that controls a listbox', () => {
    const { getByRole } = render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)
    const combobox = getByRole('combobox', { name: 'Search pages and actions' })

    expect(getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()
    expect(combobox).toHaveFocus()
    expect(combobox).toHaveAttribute('aria-controls', getByRole('listbox').id)
    expect(combobox).toHaveAttribute('aria-activedescendant', getByRole('option', { name: /^Orders/ }).id)
  })

  it('should group the commands', () => {
    const { getByRole } = render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)
    expect(getByRole('group', { name: 'Pages' })).toHaveTextContent('Orders')
    expect(getByRole('group', { name: 'Actions' })).toHaveTextContent('New order')
  })

  it('should filter by label, description, keywords and without accents', () => {
    const { getByRole, getAllByRole } = render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)
    const combobox = getByRole('combobox')

    fireEvent.change(combobox, { target: { value: 'dark' } })
    expect(getAllByRole('option')).toHaveLength(1)
    expect(getByRole('option')).toHaveTextContent('Switch theme')

    fireEvent.change(combobox, { target: { value: 'bought' } })
    expect(getByRole('option')).toHaveTextContent('Customers')

    fireEvent.change(combobox, { target: { value: 'exportacao' } })
    expect(getByRole('option')).toHaveTextContent('Exportação')
  })

  it('should show the empty text when nothing matches', () => {
    const { getByRole, queryAllByRole } = render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)

    fireEvent.change(getByRole('combobox'), { target: { value: 'zzz' } })
    expect(queryAllByRole('option')).toHaveLength(0)
    expect(getByRole('status')).toHaveTextContent('No results found')
    expect(getByRole('combobox')).not.toHaveAttribute('aria-activedescendant')
  })

  it('should move with the arrow keys, wrapping at the ends', () => {
    const { getByRole } = render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)
    const combobox = getByRole('combobox')
    const activeLabel = () => document.getElementById(combobox.getAttribute('aria-activedescendant')).textContent

    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    expect(activeLabel()).toContain('Customers')
    expect(getByRole('option', { name: /^Customers/ })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(combobox, { key: 'ArrowUp' })
    fireEvent.keyDown(combobox, { key: 'ArrowUp' })
    expect(activeLabel()).toContain('Exportação')

    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    expect(activeLabel()).toContain('Orders')
  })

  it('should run the active command with Enter and close', () => {
    const onSelect = jest.fn()
    const onOpenChange = jest.fn()
    const { getByRole } = render(<CommandPalette open onOpenChange={onOpenChange} items={makeItems(onSelect)} />)

    fireEvent.change(getByRole('combobox'), { target: { value: 'new' } })
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should run a command with a click', () => {
    const onSelect = jest.fn()
    const { getByRole } = render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems(onSelect)} />)

    fireEvent.click(getByRole('option', { name: /^Customers/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should close with Escape', () => {
    const { getByRole, queryByRole } = render(<Palette />)

    fireEvent.keyDown(getByRole('combobox'), { key: 'Escape' })
    expect(queryByRole('dialog')).toBeNull()
  })

  it('should open and close with Ctrl + K or ⌘ + K', () => {
    const { queryByRole } = render(<Palette open={false} />)

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(queryByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'K', metaKey: true })
    expect(queryByRole('dialog')).toBeNull()
  })

  it('should not listen to the shortcut without hotkey', () => {
    const { queryByRole } = render(<Palette open={false} hotkey={false} />)

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(queryByRole('dialog')).toBeNull()
  })

  it('should start a new search each time it opens', () => {
    const { getByRole, rerender } = render(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)

    fireEvent.change(getByRole('combobox'), { target: { value: 'dark' } })
    rerender(<CommandPalette open={false} onOpenChange={jest.fn()} items={makeItems()} />)
    rerender(<CommandPalette open onOpenChange={jest.fn()} items={makeItems()} />)

    expect(getByRole('combobox')).toHaveValue('')
  })

  it('should translate the texts', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <CommandPalette open onOpenChange={jest.fn()} items={[]} />
      </LocaleContext.Provider>
    )
    expect(getByRole('dialog', { name: 'Paleta de comandos' })).toBeInTheDocument()
    expect(getByRole('status')).toHaveTextContent('Nenhum resultado encontrado')
  })
})
