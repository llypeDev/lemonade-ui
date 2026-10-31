import { List, ListItem, LoadMore } from '@lemonade/ui'
import React, { useRef, useState } from 'react'

const allOrders = Array.from({ length: 14 }, (_, index) => ({
  id: 1040 + index,
  customer: ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Prado'][index % 5],
}))

function LoadMoreDemo() {
  const [count, setCount] = useState(5)
  const listRef = useRef<HTMLUListElement>(null)

  const loadMore = () =>
    new Promise((resolve) => setTimeout(resolve, 600)).then(() => setCount(Math.min(count + 5, allOrders.length)))

  return (
    <div>
      <List innerRef={listRef}>
        {allOrders.slice(0, count).map((order) => (
          <ListItem key={order.id} title={`Order #${order.id}`} description={order.customer} href={`#${order.id}`} />
        ))}
      </List>
      <LoadMore loaded={count} total={allOrders.length} onLoadMore={loadMore} listRef={listRef} />
    </div>
  )
}

export default LoadMoreDemo
