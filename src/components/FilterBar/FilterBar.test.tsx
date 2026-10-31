import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { FilterBar, FilterBarChip } from './FilterBar'

jest.mock('../../util/string')

// Popper places the popover asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

const Orders = (props: { onRemove?(id: string): void }) => {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<FilterBarChip[]>([
    { id: 'paid', label: 'Status: Paid' },
    { id: 'today', label: 'Date: Today' },
  ])
  return (
    <FilterBar
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder='Search orders'
      filters={[
        {
          id: 'status',
          label: 'Status',
          count: 1,
          content: (
            <label>
              <input type='checkbox' /> Paid
            </label>
          ),
        },
        { id: 'date', label: 'Date', content: <p>Pick a period</p> },
      ]}
      activeFilters={active}
      onRemoveFilter={(id) => {
        setActive(active.filter((chip) => chip.id !== id))
        props.onRemove && props.onRemove(id)
      }}
      onClearFilters={() => setActive([])}
      resultCount={search ? 3 : 54}
      actions={<button>Export</button>}
    />
  )
}

describe('FilterBar', () => {
  it('should render correctly', () => {
    const { container } = render(<Orders />)
    expect(container).toMatchSnapshot()
  })

  it('should search', () => {
    const { getByRole } = render(<Orders />)
    const search = getByRole('textbox', { name: 'Search' })

    expect(getByRole('search')).toContainElement(search)
    expect(getByRole('status')).toHaveTextContent('54 results')
    fireEvent.change(search, { target: { value: '1042' } })
    expect(search).toHaveValue('1042')
    expect(getByRole('status')).toHaveTextContent('3 results')
  })

  it('should open the controls of a filter in a popover', async () => {
    const { getByRole, queryByRole } = render(<Orders />)
    const status = getByRole('button', { name: 'Status 1' })

    fireEvent.click(status)
    await flush()
    expect(getByRole('dialog', { name: 'Status' })).toBeInTheDocument()
    expect(getByRole('checkbox')).toHaveFocus()
    expect(status).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should remove an active filter and clear all of them', () => {
    const onRemove = jest.fn()
    const { getByRole, queryByRole } = render(<Orders onRemove={onRemove} />)

    expect(getByRole('group', { name: 'Active filters' })).toHaveTextContent('Status: PaidDate: Today')
    fireEvent.click(getByRole('button', { name: 'Remove filter Status: Paid' }))
    expect(onRemove).toHaveBeenCalledWith('paid')
    expect(getByRole('group')).not.toHaveTextContent('Status: Paid')

    fireEvent.click(getByRole('button', { name: 'Clear filters' }))
    expect(queryByRole('group')).not.toBeInTheDocument()
  })

  it('should say when there is one result', () => {
    const { getByRole } = render(<FilterBar resultCount={1} />)
    expect(getByRole('status')).toHaveTextContent('1 result')
  })

  it('should leave out what is not given', () => {
    const { queryByRole } = render(<FilterBar filters={[]} />)
    expect(queryByRole('textbox')).not.toBeInTheDocument()
    expect(queryByRole('group')).not.toBeInTheDocument()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Orders />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument()
    expect(getByRole('status')).toHaveTextContent('54 resultados')
  })
})
