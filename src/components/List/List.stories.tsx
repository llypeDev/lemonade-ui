import React from 'react'

import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Tag } from '../Tag'
import { Text } from '../Text'
import { Tooltip } from '../Tooltip'

import { List } from './List'
import { ListItem } from './ListItem'

export default {
  title: 'Components/List',
  component: List,
}

export const People = () => (
  <List aria-label='Team' style={{ maxWidth: '28rem' }}>
    <ListItem
      media={<Avatar name='Ana Souza' />}
      title='Ana Souza'
      description='ana@example.com'
      extra={<Tag type='info'>Admin</Tag>}
    />
    <ListItem media={<Avatar name='Bruno Lima' />} title='Bruno Lima' description='bruno@example.com' />
    <ListItem
      media={<Avatar name='Carla Dias' />}
      title='Carla Dias'
      description='Invitation sent'
      extra={<Tag type='alert'>Pending</Tag>}
    />
  </List>
)

export const Links = () => (
  <List aria-label='Settings' bordered style={{ maxWidth: '28rem' }}>
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

export const WithActions = () => (
  <List aria-label='Files' style={{ maxWidth: '28rem' }}>
    {['contract.pdf', 'invoice-1042.pdf', 'photo.png'].map((file) => (
      <ListItem
        key={file}
        media={<Icon icon='fileWithItemsOutline' />}
        title={file}
        description={<Text color='secondary'>Uploaded on Oct 12</Text>}
        extra={
          <Tooltip text={`Delete ${file}`}>
            <Button size='small' skin='ghost' aria-label={`Delete ${file}`}>
              <Icon icon='trashOutline' aria-hidden='true' />
            </Button>
          </Tooltip>
        }
      />
    ))}
  </List>
)
