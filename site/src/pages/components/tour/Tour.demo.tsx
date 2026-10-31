import { Button, Flow, Heading, Text, TextInput, Tour, TourStep } from '@lemonade/ui'
import React, { useRef, useState } from 'react'

function TourDemo() {
  const [open, setOpen] = useState(false)
  const exportRef = useRef<HTMLButtonElement>(null)

  const steps: TourStep[] = [
    {
      title: 'Welcome to the new orders page',
      content: 'Take a minute to see where everything is. You can skip the tour at any time.',
    },
    {
      target: '#tour-demo-search',
      title: 'Search',
      content: 'Find an order by its number or the name of the customer.',
    },
    {
      target: exportRef,
      title: 'Export',
      content: 'Download the orders on the screen as a spreadsheet.',
      placement: 'left',
    },
  ]

  return (
    <Flow direction='vertical'>
      <Flow direction='horizontal' alignItems='center' justifyContent='space-between'>
        <Heading level={3}>Orders</Heading>
        <Button size='small' innerRef={exportRef}>
          Export
        </Button>
      </Flow>
      <div id='tour-demo-search' style={{ maxWidth: '20rem' }}>
        <TextInput icon='zoomOutline' placeholder='Search by number or customer' aria-label='Search orders' />
      </div>
      <Text color='secondary'>12 orders</Text>
      <div>
        <Button kind='primary' onClick={() => setOpen(true)}>
          Take the tour
        </Button>
      </div>
      <Tour open={open} steps={steps} onClose={() => setOpen(false)} />
    </Flow>
  )
}

export default TourDemo
