import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import enUs from '../../../i18n/locales/en-US'

import { DataTable, DataTableProps } from './DataTable'

interface Row {
  id: number
  name: string
  age: number
}

const rows: Row[] = [
  { id: 1, name: 'MARIA MACHADO DE JESUS', age: 42 },
  { id: 2, name: 'JOSÉ DA SILVA MOREIRA', age: 34 },
  { id: 3, name: 'ALICE BARBOSA', age: 27 },
]

const sortHandler = jest.fn()
const DataTableTest = (props: Partial<DataTableProps>) => (
  <DataTable
    rows={rows}
    onSortChange={sortHandler}
    sort={['id', '-name']}
    columns={[
      { name: 'id', header: 'ID', sortable: true, render: (row: Row) => row.id },
      { name: 'name', header: 'Name', sortable: true, render: (row: Row) => row.name },
      {
        name: 'age',
        header: 'Age',
        sortable: true,
        align: 'right',
        style: { color: 'red' },
        render: (row: Row) => row.age,
      },
    ]}
    {...props}
  />
)

it('should render correctly', () => {
  const { container } = render(<DataTableTest />)
  expect(container).toMatchSnapshot()
})

it('should call onSortChange with right parameters when clicked over column title', () => {
  const { container } = render(<DataTableTest />)
  fireEvent.click(container.querySelector('th[data-name="id"] button'))
  expect(sortHandler).toHaveBeenLastCalledWith(['-id'])

  fireEvent.click(container.querySelector('th[data-name="name"] button'))
  expect(sortHandler).toHaveBeenLastCalledWith(['name'])

  fireEvent.click(container.querySelector('th[data-name="id"] button'), { shiftKey: true })
  expect(sortHandler).toHaveBeenLastCalledWith(['-id', '-name'])

  fireEvent.click(container.querySelector('th[data-name="age"] button'), { shiftKey: true })
  expect(sortHandler).toHaveBeenLastCalledWith(['id', '-name', 'age'])
})

it('should render TableLoadingRow when loading prop is on', () => {
  const queryText = enUs.dataTable.loading
  expect(render(<DataTable rows={[]} columns={[]} loading={false} />).queryAllByText(queryText).length).toEqual(0)
  expect(render(<DataTable rows={[]} columns={[]} loading={true} />).queryAllByText(queryText).length).toEqual(1)
})

it('should accept the render prop', () => {
  const renderSpy = jest.fn()
  render(<DataTableTest render={renderSpy} />)
  expect(renderSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      columns: expect.anything(),
    })
  )
})

describe('onRowClick prop', () => {
  it('should call the prop with the clicked row', () => {
    const clickHandler = jest.fn()
    const { container } = render(<DataTableTest onRowClick={clickHandler} />)
    const trs = container.querySelectorAll('tbody tr')

    expect(clickHandler).not.toHaveBeenCalled()

    fireEvent.click(trs[0])
    expect(clickHandler).toHaveBeenLastCalledWith(rows[0])

    fireEvent.click(trs[trs.length - 1])
    expect(clickHandler).toHaveBeenLastCalledWith(rows[rows.length - 1])
  })
})

describe('getColumn', () => {
  const renderSpy = jest.fn()
  render(<DataTableTest render={renderSpy} />)
  const getColumn = renderSpy.mock.calls[0][0].getColumn

  it('should return the column configuration by its name', () => {
    expect(getColumn('id').name).toEqual('id')
    expect(getColumn('id').sortable).toEqual(true)
  })

  it('should return undefined for inexistent columns', () => {
    expect(getColumn('foo')).toBeUndefined()
  })
})

describe('getHeaderProps', () => {
  const renderSpy = jest.fn()
  render(<DataTableTest render={renderSpy} />)
  const getHeaderProps = renderSpy.mock.calls[0][0].getHeaderProps

  it('should return the table header props of a column configuration', () => {
    const config = getHeaderProps({
      name: 'id',
      render: () => null,
      sortable: true,
      align: 'right',
    })

    expect(config).toMatchObject({
      key: 'id',
      'data-name': 'id',
    })
    expect(config).toHaveProperty('onSortChange')
  })

  it('should throw an error for inexistent columns', () => {
    expect(() => getHeaderProps('foo')).toThrowError()
  })
})

it('should add a sort on shift click when there is no sort yet', () => {
  const handler = jest.fn()
  const { container } = render(<DataTableTest sort={undefined} onSortChange={handler} />)
  fireEvent.click(container.querySelector('th[data-name="age"] button'), { shiftKey: true })
  expect(handler).toHaveBeenLastCalledWith(['age'])
})

it('should key the rows by their ids', () => {
  const columns = [{ name: 'note', render: (row: Row) => <input aria-label={row.name} defaultValue={row.name} /> }]
  const { getByRole, rerender } = render(<DataTable rows={rows} columns={columns} />)

  rerender(<DataTable rows={[...rows].reverse()} columns={columns} />)
  expect(getByRole('textbox', { name: rows[0].name })).toHaveValue(rows[0].name)
})

it('should render on the server without warnings', () => {
  const global = window
  const windowProperty = Object.getOwnPropertyDescriptor(global, 'window')
  const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  let html: string
  try {
    // The modules load again as on a server, where there is no window
    delete (global as any).window
    jest.resetModules()
    const ServerReact = require('react')
    const { renderToString } = require('react-dom/server')
    const { DataTable: ServerDataTable } = require('./DataTable')
    const columns = [{ name: 'name', header: 'Name', render: (row: Row) => row.name }]
    html = renderToString(ServerReact.createElement(ServerDataTable, { rows, columns }))
  } finally {
    Object.defineProperty(global, 'window', windowProperty)
  }
  expect(html).toContain(rows[0].name)
  expect(error).not.toHaveBeenCalled()
  error.mockRestore()
})
