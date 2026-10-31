import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'

import { Button } from '../../Button'
import { Icon } from '../../Icon'

import { DataTable, DataTableRowId, TableColumnConfig } from './DataTable'
import { DataTableColumnsMenu } from './DataTableColumnsMenu'

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

export default {
  title: 'Components/Table',
  component: DataTable,
  args: {
    empty: false,
    onSortChange: action('sort-change'),
    sort: ['id', '-name'],
    loading: false,
    columns: [
      { name: 'id', header: 'ID', sortable: true, render: (row: Row) => row.id },
      { name: 'name', header: 'Name', sortable: true, render: (row: Row) => row.name },
      { name: 'age', header: 'Age', render: (row: Row) => row.age },
      {
        name: 'buttons',
        align: 'right',
        render: (row: Row) => (
          <>
            <Button size='small' skin='ghost'>
              <Icon icon='penOutline' />
            </Button>
            <Button size='small' skin='ghost'>
              <Icon icon='dots' />
            </Button>
          </>
        ),
      },
    ],
  },
}

export const Default = (args) => <DataTable {...args} rows={args.empty ? [] : rows} />

const people: Row[] = [
  ...rows,
  { id: 4, name: 'CARLOS EDUARDO LIMA', age: 51 },
  { id: 5, name: 'BEATRIZ SOUZA', age: 19 },
]

export const Selection = () => {
  const [selected, setSelected] = useState<DataTableRowId[]>([2, 4])
  const [list, setList] = useState(people)

  return (
    <DataTable<Row>
      rows={list}
      columns={[
        { name: 'name', header: 'Name', render: (row) => row.name },
        { name: 'age', header: 'Age', align: 'right', render: (row) => row.age },
      ]}
      selectedRows={selected}
      onSelectedRowsChange={setSelected}
      getRowLabel={(row) => row.name}
      bulkActions={(selectedRows) => (
        <>
          <Button size='small'>Export</Button>
          <Button
            size='small'
            kind='danger'
            onClick={() => {
              setList(list.filter((row) => !selectedRows.includes(row)))
              setSelected([])
            }}
          >
            Delete
          </Button>
        </>
      )}
    />
  )
}

interface Order {
  id: number
  customer: string
  date: string
  status: string
  total: string
  items: Array<{ name: string; quantity: number }>
}

const orders: Order[] = [
  {
    id: 1042,
    customer: 'Ana Souza',
    date: '12/03/2026',
    status: 'Paid',
    total: 'R$ 320,00',
    items: [
      { name: 'Coffee beans 1 kg', quantity: 2 },
      { name: 'Paper filters', quantity: 1 },
    ],
  },
  {
    id: 1043,
    customer: 'Bruno Lima',
    date: '12/03/2026',
    status: 'Pending',
    total: 'R$ 89,90',
    items: [{ name: 'French press', quantity: 1 }],
  },
  {
    id: 1044,
    customer: 'Carla Mendes',
    date: '13/03/2026',
    status: 'Paid',
    total: 'R$ 154,50',
    items: [
      { name: 'Ceramic mug', quantity: 3 },
      { name: 'Tea sampler', quantity: 1 },
    ],
  },
  {
    id: 1045,
    customer: 'Diego Rocha',
    date: '14/03/2026',
    status: 'Canceled',
    total: 'R$ 45,00',
    items: [{ name: 'Milk frother', quantity: 1 }],
  },
  {
    id: 1046,
    customer: 'Elisa Prado',
    date: '15/03/2026',
    status: 'Paid',
    total: 'R$ 210,00',
    items: [{ name: 'Grinder', quantity: 1 }],
  },
]

const orderColumns: Array<TableColumnConfig<Order>> = [
  { name: 'id', header: 'Order', render: (row) => `#${row.id}` },
  { name: 'customer', header: 'Customer', render: (row) => row.customer },
  { name: 'date', header: 'Date', render: (row) => row.date },
  { name: 'status', header: 'Status', render: (row) => row.status },
  { name: 'total', header: 'Total', align: 'right', render: (row) => row.total },
]

export const DetailsAndColumns = () => {
  const [hidden, setHidden] = useState<string[]>(['date'])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <DataTableColumnsMenu columns={orderColumns} hiddenColumns={hidden} onHiddenColumnsChange={setHidden} />
      </div>
      <div style={{ maxHeight: '18rem', overflow: 'auto' }}>
        <DataTable<Order>
          rows={orders}
          columns={orderColumns}
          hiddenColumns={hidden}
          stickyHeader
          defaultExpandedRows={[1042]}
          getRowLabel={(row) => `order #${row.id}`}
          renderExpanded={(row) => (
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              {row.items.map((item) => (
                <li key={item.name}>
                  {item.quantity} × {item.name}
                </li>
              ))}
            </ul>
          )}
        />
      </div>
    </div>
  )
}
