import React, { useRef, useState } from 'react'

import { List, ListItem } from '../List'

import { LoadMore } from './LoadMore'

export default {
  title: 'Components/LoadMore',
  component: LoadMore,
}

const orders = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  customer: ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Reis'][index % 4],
}))

export const Default = () => {
  const [count, setCount] = useState(5)
  const listRef = useRef<HTMLUListElement>(null)

  // Stands for a request to the server
  const loadMore = () =>
    new Promise<void>((resolve) => setTimeout(() => resolve(setCount((current) => current + 5)), 600))

  return (
    <div style={{ maxWidth: '28rem' }}>
      <List bordered divided innerRef={listRef} aria-label='Orders'>
        {orders.slice(0, count).map((order) => (
          <ListItem key={order.id} title={`Order #${1000 + order.id}`} description={order.customer} href='#order' />
        ))}
      </List>
      <LoadMore loaded={Math.min(count, orders.length)} total={orders.length} onLoadMore={loadMore} listRef={listRef} />
    </div>
  )
}
