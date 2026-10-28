import React from 'react'

import { Button } from '../Button'
import { Flow } from '../Flow'
import { Icon } from '../Icon'
import { Text } from '../Text'

import { Badge } from './Badge'

export default {
  title: 'Components/Badge',
  component: Badge,
}

export const Default = () => (
  <Flow direction='horizontal' gap={2} alignItems='center'>
    <Badge count={3}>
      <Button size='small' skin='ghost' aria-label='Notifications, 3 unread'>
        <Icon icon='bellOutline' />
      </Button>
    </Badge>
    <Badge count={120}>
      <Button size='small' skin='ghost' aria-label='Messages, more than 99 unread'>
        <Icon icon='emailOutline' />
      </Button>
    </Badge>
    <Badge dot>
      <Button size='small' skin='ghost' aria-label='Chat, new messages'>
        <Icon icon='chatOutline' />
      </Button>
    </Badge>
  </Flow>
)

export const Types = () => (
  <Flow direction='horizontal' gap={1} alignItems='center'>
    <Badge count={1} type='danger' />
    <Badge count={2} type='alert' />
    <Badge count={3} type='success' />
    <Badge count={4} type='info' />
    <Badge count={5} type='normal' />
  </Flow>
)

export const Standalone = () => (
  <Flow direction='horizontal' gap={0.5} alignItems='center'>
    <Text fontWeight='bold'>Pending reviews</Text>
    <Badge count={12} type='normal' label='12 pending reviews' />
  </Flow>
)
