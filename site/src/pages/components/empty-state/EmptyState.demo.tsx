import { Button, EmptyState } from '@lemonade/ui'
import React from 'react'

function EmptyStateDemo() {
  return (
    <EmptyState
      icon='zoomOutline'
      title='No orders found'
      description='No orders match the filters you chose. Try other dates or statuses.'
      actions={<Button size='small'>Clear filters</Button>}
    />
  )
}

export default EmptyStateDemo
