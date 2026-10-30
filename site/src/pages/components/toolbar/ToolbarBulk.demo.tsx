import { Button, Icon, Text, Toolbar } from '@lemonade/ui'
import React from 'react'

function ToolbarBulkDemo() {
  return (
    <Toolbar aria-label='Actions for the selected orders'>
      <Text fontWeight='bold' style={{ marginRight: 'auto' }}>
        3 orders selected
      </Text>
      <Button size='small' skin='ghost'>
        <Icon icon='download' aria-hidden='true' style={{ marginRight: '0.5rem' }} />
        Export
      </Button>
      <Button size='small' skin='ghost'>
        <Icon icon='archiveOutline' aria-hidden='true' style={{ marginRight: '0.5rem' }} />
        Archive
      </Button>
      <Button size='small' skin='ghost' kind='danger'>
        <Icon icon='trashOutline' aria-hidden='true' style={{ marginRight: '0.5rem' }} />
        Delete
      </Button>
    </Toolbar>
  )
}

export default ToolbarBulkDemo
