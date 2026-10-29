import React from 'react'

import { Card } from '../Card'
import { Flow } from '../Flow'
import { Heading } from '../Heading'
import { Link } from '../Link'
import { Tag } from '../Tag'

import { DescriptionList } from './DescriptionList'

export default {
  title: 'Components/DescriptionList',
  component: DescriptionList,
}

const profile = [
  { term: 'Name', description: 'Ana Souza' },
  { term: 'Email', description: <Link href='mailto:ana@example.com'>ana@example.com</Link> },
  { term: 'Role', description: 'Product designer' },
  { term: 'Status', description: <Tag type='success'>Active</Tag> },
]

export const Horizontal = () => (
  <div style={{ maxWidth: '36rem' }}>
    <DescriptionList items={profile} />
  </div>
)

export const Divided = () => (
  <div style={{ maxWidth: '36rem' }}>
    <DescriptionList items={profile} divided termWidth='10rem' />
  </div>
)

export const VerticalColumns = () => (
  <Card style={{ maxWidth: '48rem' }}>
    <Flow direction='vertical'>
      <Heading level={3} fontWeight='bold'>
        Order #1042
      </Heading>
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
    </Flow>
  </Card>
)
