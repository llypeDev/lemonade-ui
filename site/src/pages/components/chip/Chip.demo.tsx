import { Chip, ChipGroup, Flow, Text } from '@lemonade/ui'
import React, { useState } from 'react'

const orders = [
  { id: 1040, status: 'paid' },
  { id: 1041, status: 'shipped' },
  { id: 1042, status: 'paid' },
  { id: 1043, status: 'canceled' },
  { id: 1044, status: 'shipped' },
]

const count = (status: string) => orders.filter((order) => order.status === status).length

function ChipDemo() {
  const [status, setStatus] = useState<string[]>(['paid'])
  const shown = status.length ? orders.filter((order) => status.includes(order.status)) : orders

  return (
    <Flow direction='vertical'>
      <ChipGroup aria-label='Filter orders by status' value={status} onChange={setStatus}>
        <Chip value='paid' count={count('paid')}>
          Paid
        </Chip>
        <Chip value='shipped' count={count('shipped')}>
          Shipped
        </Chip>
        <Chip value='canceled' count={count('canceled')}>
          Canceled
        </Chip>
      </ChipGroup>
      <Text role='status'>Showing orders {shown.map((order) => `#${order.id}`).join(', ')}</Text>
    </Flow>
  )
}

export default ChipDemo
