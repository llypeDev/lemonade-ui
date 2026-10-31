import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../../i18n'
import ptBR from '../../../i18n/locales/pt-BR'

import { DataTable, TableColumnConfig } from './DataTable'
import { DataTableColumnsMenu } from './DataTableColumnsMenu'

jest.mock('../../../util/string')

// Popper places the menu asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

interface Order {
  id: number
  customer: string
  total: string
}

const orders: Order[] = [
  { id: 1042, customer: 'Ana Souza', total: 'R$ 320,00' },
  { id: 1043, customer: 'Bruno Lima', total: 'R$ 89,90' },
]

const columns: Array<TableColumnConfig<Order>> = [
  { name: 'id', header: 'Order', render: (row) => `#${row.id}` },
  { name: 'customer', header: 'Customer', render: (row) => row.customer },
  { name: 'total', header: 'Total', render: (row) => row.total },
]

const renderDetails = (row: Order) => <p>Items of order #{row.id}</p>

describe('DataTable features', () => {
  it('should render correctly with details and a sticky header', () => {
    const { container } = render(
      <DataTable
        rows={orders}
        columns={columns}
        stickyHeader
        renderExpanded={renderDetails}
        defaultExpandedRows={[1043]}
        getRowLabel={(row) => `order #${row.id}`}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should show and hide the details of a row', () => {
    const onExpandedRowsChange = jest.fn()
    const onRowClick = jest.fn()
    const { getByRole, queryByText } = render(
      <DataTable
        rows={orders}
        columns={columns}
        renderExpanded={renderDetails}
        onExpandedRowsChange={onExpandedRowsChange}
        onRowClick={onRowClick}
        getRowLabel={(row) => `order #${row.id}`}
      />
    )
    const button = getByRole('button', { name: 'Show details of order #1042' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(queryByText('Items of order #1042')).toBeInTheDocument()
    expect(onRowClick).not.toHaveBeenCalled()
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith([1042])

    const open = getByRole('button', { name: 'Hide details of order #1042' })
    expect(open).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(open.getAttribute('aria-controls'))).toHaveTextContent('Items of order #1042')
    expect(document.getElementById(open.getAttribute('aria-controls'))).toHaveAttribute('colspan', '4')

    fireEvent.click(open)
    expect(queryByText('Items of order #1042')).not.toBeInTheDocument()
  })

  it('should follow controlled expanded rows', () => {
    const { queryByText, rerender } = render(
      <DataTable rows={orders} columns={columns} renderExpanded={renderDetails} expandedRows={[]} />
    )
    expect(queryByText(/Items of order/)).not.toBeInTheDocument()

    rerender(<DataTable rows={orders} columns={columns} renderExpanded={renderDetails} expandedRows={[1043]} />)
    expect(queryByText('Items of order #1043')).toBeInTheDocument()
  })

  it('should leave out the hidden columns', () => {
    const { queryByRole, getByRole } = render(
      <DataTable rows={orders} columns={columns} hiddenColumns={['customer']} />
    )
    expect(queryByRole('columnheader', { name: 'Customer' })).not.toBeInTheDocument()
    expect(getByRole('columnheader', { name: 'Total' })).toBeInTheDocument()
  })

  it('should keep the header at the top', () => {
    const { getByRole } = render(<DataTable rows={orders} columns={columns} stickyHeader />)
    expect(getByRole('columnheader', { name: 'Order' })).toHaveStyleRule('position', 'sticky')
  })

  it('should show and hide columns from the menu, but not the last one', async () => {
    const Table = () => {
      const [hidden, setHidden] = useState<string[]>(['total'])
      return (
        <>
          <DataTableColumnsMenu columns={columns} hiddenColumns={hidden} onHiddenColumnsChange={setHidden} />
          <DataTable rows={orders} columns={columns} hiddenColumns={hidden} />
        </>
      )
    }
    const { getByRole, queryByRole } = render(<Table />)

    fireEvent.click(getByRole('button', { name: 'Columns' }))
    await flush()
    expect(getByRole('menuitemcheckbox', { name: 'Total' })).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(getByRole('menuitemcheckbox', { name: 'Total' }))
    expect(getByRole('columnheader', { name: 'Total' })).toBeInTheDocument()

    fireEvent.click(getByRole('menuitemcheckbox', { name: 'Order' }))
    fireEvent.click(getByRole('menuitemcheckbox', { name: 'Customer' }))
    expect(queryByRole('columnheader', { name: 'Customer' })).not.toBeInTheDocument()
    expect(getByRole('menuitemcheckbox', { name: 'Total' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <DataTable rows={orders} columns={columns} renderExpanded={renderDetails} />
        <DataTableColumnsMenu columns={columns} hiddenColumns={[]} onHiddenColumnsChange={jest.fn()} />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Mostrar detalhes de linha 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Colunas' })).toBeInTheDocument()
  })
})
