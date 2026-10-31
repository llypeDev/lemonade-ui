import React, { useRef, useState } from 'react'

import { Button } from '../Button'
import { Flow } from '../Flow'
import { Heading } from '../Heading'
import { Icon } from '../Icon'
import { Text } from '../Text'
import { TextInput } from '../TextField/TextInput'

import { Tour, TourStep } from './Tour'

export default {
  title: 'Components/Tour',
  component: Tour,
}

const OrdersPage = (props: { exportRef: React.RefObject<HTMLButtonElement>; onStart?(): void }) => (
  <div style={{ maxWidth: '48rem' }}>
    <Flow direction='horizontal' alignItems='center' justifyContent='space-between'>
      <Heading level={1}>Orders</Heading>
      <Flow direction='horizontal' gap={0.5}>
        {props.onStart && (
          <Button size='small' skin='ghost' onClick={props.onStart}>
            <Icon icon='infoCircleOutline' style={{ marginRight: '0.5rem' }} />
            Take the tour
          </Button>
        )}
        <Button size='small' innerRef={props.exportRef}>
          Export
        </Button>
      </Flow>
    </Flow>
    <div id='orders-search' style={{ marginTop: '1rem', maxWidth: '20rem' }}>
      <TextInput icon='zoomOutline' placeholder='Search by number or customer' aria-label='Search orders' />
    </div>
    <div
      id='orders-table'
      style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #D3D4DD', borderRadius: 4, height: '8rem' }}
    >
      <Text color='secondary'>12 orders</Text>
    </div>
  </div>
)

const useSteps = (exportRef: React.RefObject<HTMLButtonElement>): TourStep[] => [
  {
    title: 'Welcome to the new orders page',
    content: 'Take a minute to see where everything is. You can skip the tour at any time.',
  },
  {
    target: '#orders-search',
    title: 'Search',
    content: 'Find an order by its number or the name of the customer.',
  },
  {
    target: '#orders-table',
    title: 'Your orders',
    content: 'The newest orders come first. Click an order to see its items.',
    placement: 'top',
  },
  {
    target: exportRef,
    title: 'Export',
    content: 'Download the orders on the screen as a spreadsheet.',
    placement: 'left',
  },
]

export const Default = () => {
  const exportRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const steps = useSteps(exportRef)

  return (
    <>
      <OrdersPage exportRef={exportRef} onStart={() => setOpen(true)} />
      <Tour open={open} steps={steps} onClose={() => setOpen(false)} />
    </>
  )
}

Default.parameters = {
  // The tour opens with a click
  loki: { skip: true },
}

export const OnAStep = () => {
  const exportRef = useRef<HTMLButtonElement>(null)
  const steps = useSteps(exportRef)

  return (
    <>
      <OrdersPage exportRef={exportRef} />
      <Tour open defaultStep={1} steps={steps} onClose={() => undefined} />
      <div style={{ height: 'calc(100vh - 2rem)' }} />
    </>
  )
}
