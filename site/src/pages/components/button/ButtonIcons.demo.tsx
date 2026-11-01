import { Button, Icon, Text } from '@lemonade/ui'
import React from 'react'

function ButtonIcons() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
      <Button kind='primary'>
        <Icon icon='rocket' style={{ marginRight: '0.5rem' }} />
        <Text color='inherit'>Launch</Text>
      </Button>
      <Button>
        <Icon icon='rocket' style={{ marginRight: '0.5rem' }} />
        <Text color='inherit'>Launch</Text>
      </Button>
      <Button skin='ghost' kind='primary'>
        <Icon icon='rocket' style={{ marginRight: '0.5rem' }} />
        <Text color='inherit'>Launch</Text>
      </Button>
    </div>
  )
}

export default ButtonIcons
