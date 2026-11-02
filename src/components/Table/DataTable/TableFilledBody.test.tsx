import { render } from '@testing-library/react'
import React from 'react'

import enUs from '../../../i18n/locales/en-US'

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
