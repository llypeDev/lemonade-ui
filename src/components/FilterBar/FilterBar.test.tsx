import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'
import { focusRingStates } from '../../test/utils/resolveStyle'

import { FilterBar, FilterBarChip } from './FilterBar'

jest.mock('../../util/string')

// Popper places the popover asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

// Enter on a focused button clicks it, as in the browser
const pressEnter = (element: HTMLElement) => {
  element.focus()
  fireEvent.keyDown(element, { key: 'Enter' })
  fireEvent.click(element)
}

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

    fireEvent.click(getByRole('button', { name: 'Remover o filtro Status: Paid' }))
    expect(getByRole('status')).toHaveTextContent('Filtro Status: Paid removido. 54 resultados')
    fireEvent.click(getByRole('button', { name: 'Limpar filtros' }))
    expect(getByRole('status')).toHaveTextContent('Filtros limpos. 54 resultados')
  })
})

describe('FilterBar focus after removing', () => {
  it('should move the focus to the next active filter, else to the previous one', () => {
    const first = render(<Orders />)
    pressEnter(first.getByRole('button', { name: 'Remove filter Status: Paid' }))
    expect(first.getByRole('button', { name: 'Remove filter Date: Today' })).toHaveFocus()
    first.unmount()

    const second = render(<Orders />)
    pressEnter(second.getByRole('button', { name: 'Remove filter Date: Today' }))
    expect(second.getByRole('button', { name: 'Remove filter Status: Paid' })).toHaveFocus()
  })

  it('should move the focus to the first filter after removing the last active one or clearing them', () => {
    const first = render(<Orders />)
    pressEnter(first.getByRole('button', { name: 'Remove filter Status: Paid' }))
    pressEnter(first.getByRole('button', { name: 'Remove filter Date: Today' }))
    expect(first.getByRole('button', { name: 'Status 1' })).toHaveFocus()
    first.unmount()

    const second = render(<Orders />)
    pressEnter(second.getByRole('button', { name: 'Clear filters' }))
    expect(second.getByRole('button', { name: 'Status 1' })).toHaveFocus()
  })

  it('should move the focus to the search field when there are no filters', () => {
    const Search = () => {
      const [active, setActive] = useState<FilterBarChip[]>([{ id: 'paid', label: 'Status: Paid' }])
      return (
        <FilterBar
          onSearchChange={jest.fn()}
          activeFilters={active}
          onRemoveFilter={(id) => setActive(active.filter((chip) => chip.id !== id))}
        />
      )
    }
    const { getByRole } = render(<Search />)

    pressEnter(getByRole('button', { name: 'Remove filter Status: Paid' }))
    expect(getByRole('textbox', { name: 'Search' })).toHaveFocus()
  })

  it('should wait for the application to remove the filter, and leave the focus alone if it keeps it', () => {
    let removeLater: () => void
    const Later = () => {
      const [active, setActive] = useState<FilterBarChip[]>([
        { id: 'paid', label: 'Status: Paid' },
        { id: 'today', label: 'Date: Today' },
      ])
      return (
        <FilterBar
          activeFilters={active}
          onRemoveFilter={(id) => {
            removeLater = () => setActive(active.filter((chip) => chip.id !== id))
          }}
        />
      )
    }
    const { getByRole } = render(<Later />)
    const remove = getByRole('button', { name: 'Remove filter Status: Paid' })

    pressEnter(remove)
    expect(remove).toHaveFocus()
    act(() => removeLater())
    expect(getByRole('button', { name: 'Remove filter Date: Today' })).toHaveFocus()
  })

  it('should leave the focus alone when the remove button did not have it', () => {
    const { getByRole } = render(<Orders />)
    const search = getByRole('textbox', { name: 'Search' })

    // A click that does not focus the button, as in Safari
    search.focus()
    fireEvent.click(getByRole('button', { name: 'Remove filter Status: Paid' }))
    expect(search).toHaveFocus()
  })

  it('should announce the removed filter, with the number of results', () => {
    const { getByRole } = render(<Orders />)

    fireEvent.click(getByRole('button', { name: 'Remove filter Status: Paid' }))
    expect(getByRole('status')).toHaveTextContent('Filter Status: Paid removed. 54 results')

    fireEvent.click(getByRole('button', { name: 'Clear filters' }))
    expect(getByRole('status')).toHaveTextContent('Filters cleared. 54 results')
  })
})

it('should show the focus ring of the remove button for the keyboard, not after a click', () => {
  const { getByRole } = render(<Orders />)
  const { received, expected } = focusRingStates(getByRole('button', { name: 'Remove filter Status: Paid' }))
  expect(received).toEqual(expected)
})
