import { Badge, Button, Flow, Icon } from '@lemonade/ui'
import React from 'react'

function BadgeDemo() {
  return (
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
}

export default BadgeDemo
