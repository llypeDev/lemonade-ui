import { Tag } from '@lemonade/ui'
import React from 'react'

function TagRemovable() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <Tag removable onRemove={console.log}>
        Normal
      </Tag>
      <Tag type='alert' removable onRemove={console.log}>
        Alert
      </Tag>
      <Tag type='danger' removable onRemove={console.log}>
        Danger
      </Tag>
      <Tag type='info' removable onRemove={console.log}>
        Info
      </Tag>
      <Tag type='success' removable onRemove={console.log}>
        Success
      </Tag>
    </div>
  )
}

export default TagRemovable
