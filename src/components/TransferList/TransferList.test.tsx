import { fireEvent, render, within } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { TransferList, TransferListItem } from './TransferList'

jest.mock('../../util/string')

const permissions: TransferListItem[] = [
  { id: 'read', label: 'Read orders' },
  { id: 'write', label: 'Edit orders', description: 'Change items and prices' },
  { id: 'refund', label: 'Refund payments' },
  { id: 'admin', label: 'Manage users', disabled: true },
]

const listItems = (section: HTMLElement) => Array.from(section.querySelectorAll('li')).map((li) => li.textContent)

const panels = (getAllByRole: (role: string) => HTMLElement[]) => {
  const [source, target] = getAllByRole('region')
  return { source, target }
}

describe('TransferList', () => {
  it('should render correctly', () => {
    const { container } = render(<TransferList items={permissions} defaultValue={['read']} />)
    expect(container).toMatchSnapshot()
  })

  it('should split the items between the two lists', () => {
    const { getAllByRole, getByRole } = render(<TransferList items={permissions} defaultValue={['refund']} />)
    const { source, target } = panels(getAllByRole)

    expect(getByRole('region', { name: 'Available' })).toBe(source)
    expect(listItems(source)).toEqual(['Read orders', 'Edit ordersChange items and prices', 'Manage users'])
    expect(listItems(target)).toEqual(['Refund payments'])
    expect(target).toHaveTextContent('0 of 1 checked')
  })

  it('should move the checked items and announce it', () => {
    const onChange = jest.fn()
    const { getAllByRole, getByRole } = render(<TransferList items={permissions} onChange={onChange} />)
    const { source, target } = panels(getAllByRole)
    const moveRight = getByRole('button', { name: 'Move the checked items to Selected' })

    expect(moveRight).toBeDisabled()
    fireEvent.click(within(source).getByRole('checkbox', { name: 'Refund payments' }))
    fireEvent.click(within(source).getByRole('checkbox', { name: 'Read orders' }))
    expect(source).toHaveTextContent('2 of 4 checked')

    fireEvent.click(moveRight)
    // The second list keeps the order of the items
    expect(onChange).toHaveBeenLastCalledWith(['read', 'refund'])
    expect(listItems(target)).toEqual(['Read orders', 'Refund payments'])
    expect(source).toHaveTextContent('0 of 2 checked')
    expect(getByRole('status')).toHaveTextContent('2 moved to Selected.')
  })

  it('should move all the items, except disabled ones', () => {
    const { getAllByRole, getByRole } = render(<TransferList items={permissions} />)
    const { source, target } = panels(getAllByRole)

    fireEvent.click(getByRole('button', { name: 'Move all items to Selected' }))
    expect(listItems(source)).toEqual(['Manage users'])
    expect(listItems(target)).toHaveLength(3)

    fireEvent.click(getByRole('button', { name: 'Move all items to Available' }))
    expect(listItems(target)).toEqual(['No items'])
  })

  it('should check all the items of a list', () => {
    const { getAllByRole, getByRole } = render(<TransferList items={permissions} />)
    const { source } = panels(getAllByRole)
    const all = getByRole('checkbox', { name: 'Select all in Available' }) as HTMLInputElement

    fireEvent.click(within(source).getByRole('checkbox', { name: 'Read orders' }))
    expect(all.indeterminate).toBe(true)

    fireEvent.click(all)
    expect(all).toBeChecked()
    expect(within(source).getByRole('checkbox', { name: 'Manage users' })).not.toBeChecked()
    expect(source).toHaveTextContent('3 of 4 checked')
  })

  it('should search a list, ignoring case and accents', () => {
    const items = [...permissions, { id: 'export', label: 'Exportar relatórios' }]
    const { getAllByRole, getByRole } = render(<TransferList items={items} />)
    const { source } = panels(getAllByRole)

    fireEvent.change(getByRole('textbox', { name: 'Search in Available' }), { target: { value: 'RELATORIO' } })
    expect(listItems(source)).toEqual(['Exportar relatórios'])

    fireEvent.change(getByRole('textbox', { name: 'Search in Available' }), { target: { value: 'prices' } })
    expect(listItems(source)).toEqual(['Edit ordersChange items and prices'])

    fireEvent.change(getByRole('textbox', { name: 'Search in Available' }), { target: { value: 'zzz' } })
    expect(listItems(source)).toEqual(['No results'])
  })

  it('should move only the items that match the search when moving all', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<TransferList items={permissions} onChange={onChange} />)

    fireEvent.change(getByRole('textbox', { name: 'Search in Available' }), { target: { value: 'orders' } })
    fireEvent.click(getByRole('button', { name: 'Move all items to Selected' }))
    expect(onChange).toHaveBeenLastCalledWith(['read', 'write'])
  })

  it('should follow a controlled value', () => {
    const { getAllByRole, rerender } = render(<TransferList items={permissions} value={['read']} />)
    rerender(<TransferList items={permissions} value={['read', 'write']} />)
    expect(listItems(panels(getAllByRole).target)).toEqual(['Read orders', 'Edit ordersChange items and prices'])
  })

  it('should accept the titles of the lists and hide the search', () => {
    const { getByRole, queryByRole } = render(
      <TransferList
        items={permissions}
        sourceLabel='All permissions'
        targetLabel='Role permissions'
        searchable={false}
      />
    )
    expect(getByRole('region', { name: 'Role permissions' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Move all items to Role permissions' })).toBeInTheDocument()
    expect(queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <TransferList items={permissions} />
      </LocaleContext.Provider>
    )
    expect(getByRole('region', { name: 'Disponíveis' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Mover todos os itens para Selecionados' })).toBeInTheDocument()
  })
})
