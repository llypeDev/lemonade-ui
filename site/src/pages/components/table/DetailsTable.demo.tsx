import { DataTable, DataTableColumnsMenu, TableColumnConfig } from '@lemonade/ui'
import React, { useState } from 'react'

interface Order {
  id: number
  customer: string
  date: string
  status: string
  total: string
  items: string[]
}

const orders: Order[] = [
  {
    id: 1042,
    customer: 'Ana Souza',
    date: '12/03/2026',
    status: 'Paid',
    total: 'R$ 320,00',
    items: ['2 × Coffee beans 1 kg', '1 × Paper filters'],
  },
  {
    id: 1043,
    customer: 'Bruno Lima',
    date: '12/03/2026',
    status: 'Pending',
    total: 'R$ 89,90',
    items: ['1 × French press'],
  },
  {
    id: 1044,
    customer: 'Carla Mendes',
    date: '13/03/2026',
    status: 'Paid',
    total: 'R$ 154,50',
    items: ['3 × Ceramic mug', '1 × Tea sampler'],
  },
  {
    id: 1045,
    customer: 'Diego Rocha',
    date: '14/03/2026',
    status: 'Canceled',
    total: 'R$ 45,00',
    items: ['1 × Milk frother'],
  },
  { id: 1046, customer: 'Elisa Prado', date: '15/03/2026', status: 'Paid', total: 'R$ 210,00', items: ['1 × Grinder'] },
  {
    id: 1047,
    customer: 'Fábio Nunes',
    date: '15/03/2026',
    status: 'Pending',
    total: 'R$ 78,00',
    items: ['2 × Ceramic mug'],
  },
]

const columns: Array<TableColumnConfig<Order>> = [
  { name: 'id', header: 'Order', render: (row) => `#${row.id}` },
  { name: 'customer', header: 'Customer', render: (row) => row.customer },
  { name: 'date', header: 'Date', render: (row) => row.date },
  { name: 'status', header: 'Status', render: (row) => row.status },
  { name: 'total', header: 'Total', align: 'right', render: (row) => row.total },
]

function DetailsTableDemo() {
  const [hidden, setHidden] = useState<string[]>(['date'])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <DataTableColumnsMenu columns={columns} hiddenColumns={hidden} onHiddenColumnsChange={setHidden} />
      </div>
      <div style={{ maxHeight: '20rem', overflow: 'auto' }}>
        <DataTable<Order>
          rows={orders}
          columns={columns}
          hiddenColumns={hidden}
          stickyHeader
          getRowLabel={(row) => `order #${row.id}`}
          renderExpanded={(row) => (
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              {row.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        />
      </div>
    </div>
  )
}

export default DetailsTableDemo
