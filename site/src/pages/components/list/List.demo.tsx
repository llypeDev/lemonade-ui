import { Avatar, Button, Icon, List, ListItem, Tag, Tooltip } from '@lemonade/ui'
import React from 'react'

const people = [
  { name: 'Ana Souza', email: 'ana@example.com', role: 'Admin' },
  { name: 'Bruno Lima', email: 'bruno@example.com' },
  { name: 'Carla Dias', email: 'Invitation sent', role: 'Pending' },
]

function ListDemo() {
  return (
    <List aria-label='Team' style={{ maxWidth: '32rem' }}>
      {people.map((person) => (
        <ListItem
          key={person.name}
          media={<Avatar name={person.name} />}
          title={person.name}
          description={person.email}
          extra={
            <>
              {person.role && <Tag type={person.role === 'Admin' ? 'info' : 'alert'}>{person.role}</Tag>}
              <Tooltip text={`Remove ${person.name}`}>
                <Button size='small' skin='ghost' aria-label={`Remove ${person.name}`}>
                  <Icon icon='trashOutline' aria-hidden='true' />
                </Button>
              </Tooltip>
            </>
          }
        />
      ))}
    </List>
  )
}

export default ListDemo
