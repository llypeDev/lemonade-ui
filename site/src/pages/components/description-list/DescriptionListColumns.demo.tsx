import { DescriptionList, Tag } from '@lemonade/ui'
import React from 'react'

function DescriptionListColumnsDemo() {
  return (
    <DescriptionList
      layout='vertical'
      columns={3}
      items={[
        { term: 'Placed on', description: 'Oct 12, 2026' },
        { term: 'Payment', description: 'Credit card' },
        { term: 'Total', description: '$ 184.90' },
        { term: 'Shipping', description: 'Standard, 5 to 7 days' },
        { term: 'Address', description: '1200 Lemon Street, Springfield' },
        { term: 'Status', description: <Tag type='info'>In transit</Tag> },
      ]}
    />
  )
}

export default DescriptionListColumnsDemo
