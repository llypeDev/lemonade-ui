import React from 'react'

import { Avatar } from '../Avatar'
import { Flow } from '../Flow'
import { Link } from '../Link'
import { Text } from '../Text'

import { HoverCard } from './HoverCard'

export default {
  title: 'Components/HoverCard',
  component: HoverCard,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '14rem' }}>
        <Story />
      </div>
    ),
  ],
}

const profile = (
  <Flow direction='horizontal' gap={0.75} alignItems='flex-start'>
    <Avatar name='Ana Souza' />
    <div>
      <Text fontWeight='bold' component='div'>
        Ana Souza
      </Text>
      <Text color='secondary' component='div'>
        Product designer · São Paulo
      </Text>
      <Text component='p' style={{ margin: '0.5rem 0 0' }}>
        Works on the checkout and the orders pages. 32 orders reviewed this month.
      </Text>
    </div>
  </Flow>
)

export const Default = () => (
  <Text component='p'>
    Order #1042 was approved by{' '}
    <HoverCard content={profile}>
      <Link href='#ana'>Ana Souza</Link>
    </HoverCard>{' '}
    yesterday.
  </Text>
)

Default.parameters = {
  // The card shows on hover
  loki: { skip: true },
}
