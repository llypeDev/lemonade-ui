import { Avatar, Badge, Flow, Text } from '@lemonade/ui'
import React from 'react'

function BadgeVariantsDemo() {
  return (
    <Flow direction='vertical'>
      <Flow direction='horizontal' alignItems='center'>
        <Badge count={1} type='danger' />
        <Badge count={2} type='alert' />
        <Badge count={3} type='success' />
        <Badge count={4} type='info' />
        <Badge count={5} type='normal' />
      </Flow>
      <Flow direction='horizontal' gap={0.5} alignItems='center'>
        <Text fontWeight='bold'>Pending reviews</Text>
        <Badge count={12} type='normal' label='12 pending reviews' />
      </Flow>
      <Badge dot type='success' overlap='circular' label='Online'>
        <Avatar name='Ana Souza' />
      </Badge>
    </Flow>
  )
}

export default BadgeVariantsDemo
