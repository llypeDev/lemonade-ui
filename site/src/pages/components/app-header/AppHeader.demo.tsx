import { AppHeader, Avatar, Badge, Button, Icon, Link, Text, TextField, Tooltip } from '@lemonade/ui'
import React from 'react'

function AppHeaderDemo() {
  return (
    <AppHeader
      logo={
        <Link href='#' style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Icon icon='lemonade' size={1.5} fill='primary' aria-hidden='true' />
          <Text fontWeight='bold' fontSize={1}>
            Lemonade
          </Text>
        </Link>
      }
      actions={
        <>
          <Tooltip text='Notifications'>
            <Badge dot>
              <Button size='small' skin='ghost' aria-label='Notifications'>
                <Icon icon='bellOutline' aria-hidden='true' />
              </Button>
            </Badge>
          </Tooltip>
          <Avatar name='Ana Souza' size='small' />
        </>
      }
    >
      <div style={{ width: '100%', maxWidth: '20rem' }}>
        <TextField icon='zoomOutline' placeholder='Search' aria-label='Search' />
      </div>
    </AppHeader>
  )
}

export default AppHeaderDemo
