import { Button, EmptyState, Link } from '@lemonade/ui'
import React from 'react'

function EmptyStateFirstUseDemo() {
  return (
    <EmptyState
      icon='inboxOutline'
      title='You have no projects yet'
      description='Projects group your tasks and files. Create the first one to get started.'
      actions={
        <>
          <Button size='small' kind='primary'>
            Create project
          </Button>
          <Link href='#learn'>Learn about projects</Link>
        </>
      }
    />
  )
}

export default EmptyStateFirstUseDemo
