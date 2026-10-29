import { DescriptionList, Link, Tag } from '@lemonade/ui'
import React from 'react'

function DescriptionListDemo() {
  return (
    <div style={{ maxWidth: '36rem' }}>
      <DescriptionList
        divided
        items={[
          { term: 'Name', description: 'Ana Souza' },
          { term: 'Email', description: <Link href='mailto:ana@example.com'>ana@example.com</Link> },
          { term: 'Role', description: 'Product designer' },
          { term: 'Status', description: <Tag type='success'>Active</Tag> },
        ]}
      />
    </div>
  )
}

export default DescriptionListDemo
