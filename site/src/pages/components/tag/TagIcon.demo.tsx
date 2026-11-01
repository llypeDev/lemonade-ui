import { Tag } from '@lemonade/ui'
import React from 'react'

function TagIcon() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <Tag icon='userFilled'>Normal</Tag>
      <Tag type='alert' icon='exclamationTriangleFilled'>
        Alert
      </Tag>
      <Tag type='danger' icon='banFilled'>
        Danger
      </Tag>
      <Tag type='info' icon='infoCircleFilled'>
        Info
      </Tag>
      <Tag type='success' icon='checkCircleFilled'>
        Success
      </Tag>
    </div>
  )
}

export default TagIcon
