import { Avatar, Flow, HoverCard, Link, Text } from '@lemonade/ui'
import React from 'react'

function HoverCardDemo() {
  return (
    <Text component='p' style={{ minHeight: '10rem' }}>
      Order #1042 was approved by{' '}
      <HoverCard
        content={
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
                Works on the checkout and the orders pages.
              </Text>
            </div>
          </Flow>
        }
      >
        <Link href='#ana'>Ana Souza</Link>
      </HoverCard>{' '}
      yesterday.
    </Text>
  )
}

export default HoverCardDemo
