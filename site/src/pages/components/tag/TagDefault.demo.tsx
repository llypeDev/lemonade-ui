import { Tag } from '@lemonade/ui'
import React from 'react'

function TagDefault() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <Tag>Normal</Tag>
      <Tag type='alert'>Alert</Tag>
      <Tag type='danger'>Danger</Tag>
      <Tag type='info'>Info</Tag>
      <Tag type='success'>Success</Tag>
    </div>
  )
}

export default TagDefault
