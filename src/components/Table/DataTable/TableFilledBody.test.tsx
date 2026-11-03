import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import enUs from '../../../i18n/locales/en-US'
import { resolveStyle } from '../../../test/utils/resolveStyle'

import { TableFilledBody, TableFilledBodyProps } from './TableFilledBody'

interface Row {
  id: number
  name: string
}

const rows: Row[] = [
  { id: 1, name: 'MARIA MACHADO DE JESUS' },
  { id: 2, name: 'JOSÉ DA SILVA MOREIRA' },
  { id: 3, name: 'ALICE BARBOSA' },
]

const createTable = (props?: Partial<TableFilledBodyProps>) => (
  <table>
    <TableFilledBody
      columns={[
        { name: 'id', header: 'ID', sortable: true, render: (row: Row) => row.id },
        { name: 'name', header: 'Name', sortable: true, render: (row: Row) => row.name },
      ]}
      rows={rows}
      loading={false}
      {...props}
    />
  </table>
)

it('should render correctly', () => {
  const { container } = render(createTable())
  expect(container).toMatchSnapshot()
})

it('should render the TableLoadingRow if loading is true', () => {
  const queryText = enUs.dataTable.loading
  expect(render(createTable({ loading: false })).queryAllByText(queryText).length).toEqual(0)
  expect(render(createTable({ loading: true })).queryAllByText(queryText).length).toEqual(1)
})

it('should render TablePlaceholderRow if loading is false and there are no rows', () => {
  const queryText = enUs.dataTable.empty
  expect(render(createTable()).queryAllByText(queryText).length).toEqual(0)
  expect(render(createTable({ rows: [], loading: true })).queryAllByText(queryText).length).toEqual(0)
  expect(render(createTable({ rows: [], loading: false })).queryAllByText(queryText).length).toEqual(1)
})

it('should render the loading and placeholder rows without rows', () => {
  expect(render(createTable({ rows: undefined, loading: true })).getByText(enUs.dataTable.loading)).toBeInTheDocument()
  expect(render(createTable({ rows: null, loading: false })).getByText(enUs.dataTable.empty)).toBeInTheDocument()
})

it('should keep the state of a row in that row when the rows above it go away', () => {
  const columns = [{ name: 'note', render: (row: Row) => <input aria-label={row.name} defaultValue={row.name} /> }]
  const body = (props: Partial<TableFilledBodyProps>) =>
    createTable({ columns, getRowId: (row: Row) => row.id, ...props })
  const { getByRole, rerender } = render(body({ rows }))

  rerender(body({ rows: rows.slice(1) }))
  expect(getByRole('textbox', { name: rows[1].name })).toHaveValue(rows[1].name)
})

describe('while loading', () => {
  const onEdit = jest.fn()
  const columns = [
    { name: 'name', header: 'Name', render: (row: Row) => row.name },
    {
      name: 'edit',
      render: (row: Row) => (
        <button type='button' onClick={() => onEdit(row)}>
          Edit {row.name}
        </button>
      ),
    },
  ]
  const loadingTable = (props: Partial<TableFilledBodyProps>) =>
    createTable({ columns, getRowId: (row: Row) => row.id, ...props })
  const rowOf = (container: HTMLElement, row: Row) =>
    Array.from(container.querySelectorAll('tbody > tr')).find((tr) => tr.textContent.startsWith(row.name))

  beforeEach(() => onEdit.mockClear())

  it('should keep the rows in place, under a message that takes no space of its own', () => {
    const { container, getByText } = render(loadingTable({ loading: true }))
    const message = getByText(enUs.dataTable.loading)
    const messageCell = message.closest('td')

    // The message is in a row before the others that has no height, and it shows over the first row
    expect(container.querySelectorAll('tbody > tr')).toHaveLength(rows.length + 1)
    expect(messageCell.parentElement).toBe(container.querySelector('tbody > tr:first-child'))
    expect(messageCell).toHaveAttribute('colspan', '2')
    expect(resolveStyle(messageCell, 'height')).toEqual('0')
    expect(resolveStyle(messageCell, 'padding')).toEqual('0')
    expect(resolveStyle(messageCell, 'border')).toEqual('0')
    expect(resolveStyle(messageCell, 'position')).toEqual('relative')
    expect(resolveStyle(message, 'position')).toEqual('absolute')
    rows.forEach((row) => expect(rowOf(container, row)).toHaveTextContent(`${row.name}Edit ${row.name}`))
  })

  it('should dim the rows and take them out of the reach of clicks and the keyboard', () => {
    const { container, rerender } = render(loadingTable({ loading: true }))

    rows.forEach((row) => {
      const tr = rowOf(container, row)
      expect(tr).toHaveAttribute('inert')
      expect(resolveStyle(tr, 'opacity')).toEqual('0.5')
      expect(resolveStyle(tr, 'pointer-events')).toEqual('none')
    })

    rerender(loadingTable({ loading: false }))
    container.querySelectorAll('tbody > tr').forEach((tr) => {
      expect(tr).not.toHaveAttribute('inert')
      expect(resolveStyle(tr, 'opacity')).toEqual('')
      expect(resolveStyle(tr, 'pointer-events')).toEqual('')
    })
  })

  it('should not call onRowClick nor the buttons of the rows until it ends', () => {
    const onRowClick = jest.fn()
    const { getByRole, getByText, rerender } = render(loadingTable({ loading: true, onRowClick }))

    fireEvent.click(getByText(rows[0].name))
    fireEvent.click(getByRole('button', { name: `Edit ${rows[1].name}` }))
    expect(onRowClick).not.toHaveBeenCalled()
    expect(onEdit).not.toHaveBeenCalled()

    rerender(loadingTable({ loading: false, onRowClick }))
    fireEvent.click(getByText(rows[0].name))
    fireEvent.click(getByRole('button', { name: `Edit ${rows[1].name}` }))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
    expect(onEdit).toHaveBeenCalledWith(rows[1])
  })

  it('should tell screen readers that the body is busy', () => {
    const { container, rerender } = render(loadingTable({ loading: true }))
    expect(container.querySelector('tbody')).toHaveAttribute('aria-busy', 'true')

    rerender(loadingTable({ loading: true, rows: [] }))
    expect(container.querySelector('tbody')).toHaveAttribute('aria-busy', 'true')

    rerender(loadingTable({ loading: false }))
    expect(container.querySelector('tbody')).not.toHaveAttribute('aria-busy')
  })

  it('should keep the loading row, with its own height, when there are no rows', () => {
    const { getByText } = render(loadingTable({ loading: true, rows: [] }))
    const message = getByText(enUs.dataTable.loading)

    expect(resolveStyle(message.closest('td'), 'height')).toEqual('2.5rem')
    expect(resolveStyle(message, 'position')).toEqual('')
  })

  it('should keep the state of the rows', () => {
    const inputs = [{ name: 'note', render: (row: Row) => <input aria-label={row.name} defaultValue={row.name} /> }]
    const body = (props: Partial<TableFilledBodyProps>) =>
      createTable({ columns: inputs, getRowId: (row: Row) => row.id, ...props })
    const { getByRole, rerender } = render(body({ loading: false }))

    fireEvent.change(getByRole('textbox', { name: rows[0].name }), { target: { value: 'Typed' } })
    rerender(body({ loading: true }))
    rerender(body({ loading: false }))
    expect(getByRole('textbox', { name: rows[0].name })).toHaveValue('Typed')
  })

  it('should give the focus back to the button of a row that had it, once loading ends', () => {
    const { getByRole, rerender } = render(loadingTable({ loading: false }))
    const button = getByRole('button', { name: `Edit ${rows[1].name}` })

    button.focus()
    rerender(loadingTable({ loading: true }))
    // The browser takes the focus from an element that turns inert
    button.blur()
    rerender(loadingTable({ loading: false }))
    expect(button).toHaveFocus()
  })

  it('should leave the focus where the user moved it while loading', () => {
    const withOther = (loading: boolean) => (
      <>
        <button type='button'>Elsewhere</button>
        {loadingTable({ loading })}
      </>
    )
    const { getByRole, rerender } = render(withOther(false))

    getByRole('button', { name: `Edit ${rows[1].name}` }).focus()
    rerender(withOther(true))
    getByRole('button', { name: 'Elsewhere' }).focus()
    rerender(withOther(false))
    expect(getByRole('button', { name: 'Elsewhere' })).toHaveFocus()
  })
})
