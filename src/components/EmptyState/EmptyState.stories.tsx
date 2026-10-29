import React from 'react'

import { Button } from '../Button'
import { Link } from '../Link'

import { EmptyState } from './EmptyState'

export default {
  title: 'Components/EmptyState',
  component: EmptyState,
}

export const NoResults = () => (
  <EmptyState
    icon='zoomOutline'
    title='No orders found'
    description='No orders match the filters you chose. Try other dates or statuses.'
    actions={<Button size='small'>Clear filters</Button>}
  />
)

export const FirstUse = () => (
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

export const Minimal = () => <EmptyState title='Nothing to show' description='This list is empty.' />
