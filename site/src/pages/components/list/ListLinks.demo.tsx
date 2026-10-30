import { Badge, Icon, List, ListItem } from '@lemonade/ui'
import React from 'react'

function ListLinksDemo() {
  return (
    <List aria-label='Settings' bordered style={{ maxWidth: '32rem' }}>
      <ListItem
        href='#'
        media={<Icon icon='userOutline' />}
        title='Profile'
        description='Name, photo and contact'
        extra={<Icon icon='angleRight' aria-hidden='true' />}
      />
      <ListItem
        href='#'
        media={<Icon icon='bellOutline' />}
        title='Notifications'
        description='Email and push'
        extra={<Badge count={2} label='2 new' />}
      />
      <ListItem
        href='#'
        media={<Icon icon='lockCloseOutline' />}
        title='Security'
        description='Password and sessions'
        extra={<Icon icon='angleRight' aria-hidden='true' />}
      />
    </List>
  )
}

export default ListLinksDemo
