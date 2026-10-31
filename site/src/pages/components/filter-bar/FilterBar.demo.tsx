import { Button, Checkbox, FilterBar, List, ListItem, VFlow } from '@lemonade/ui'
import React, { useState } from 'react'

const orders = [
  { id: 1042, customer: 'Ana Souza', status: 'Paid' },
  { id: 1043, customer: 'Bruno Lima', status: 'Pending' },
  { id: 1044, customer: 'Carla Mendes', status: 'Paid' },
  { id: 1045, customer: 'Diego Rocha', status: 'Canceled' },
  { id: 1046, customer: 'Elisa Prado', status: 'Pending' },
]

const statuses = ['Paid', 'Pending', 'Canceled']

function FilterBarDemo() {
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<string[]>(['Paid'])

  const toggle = (status: string) =>
    setPicked(picked.includes(status) ? picked.filter((item) => item !== status) : [...picked, status])

  const results = orders.filter(
    (order) =>
      (picked.length === 0 || picked.includes(order.status)) &&
      order.customer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <VFlow>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder='Search customers'
        filters={[
          {
            id: 'status',
            label: 'Status',
            count: picked.length,
            content: (
              <VFlow vSpacing={0.5} style={{ padding: '1rem' }}>
                {statuses.map((status) => (
                  <Checkbox
                    key={status}
                    label={status}
                    checked={picked.includes(status)}
                    onChange={() => toggle(status)}
                  />
                ))}
              </VFlow>
            ),
          },
        ]}
        activeFilters={picked.map((status) => ({ id: status, label: `Status: ${status}` }))}
        onRemoveFilter={(id) => setPicked(picked.filter((item) => item !== id))}
        onClearFilters={() => setPicked([])}
        resultCount={results.length}
        actions={
          <Button size='small' skin='ghost'>
            Export
          </Button>
        }
      />
      <List>
        {results.map((order) => (
          <ListItem key={order.id} title={`#${order.id} · ${order.customer}`} description={order.status} />
        ))}
      </List>
    </VFlow>
  )
}

export default FilterBarDemo
