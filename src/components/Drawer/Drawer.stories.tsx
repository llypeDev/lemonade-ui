import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Flow } from '../Flow'
import { Text } from '../Text'

import { Drawer, DrawerPlacement } from './Drawer'

export default {
  title: 'Components/Drawer',
  component: Drawer,
  args: {
    open: true,
    placement: 'right',
  },
  argTypes: {
    placement: {
      options: ['left', 'right', 'top', 'bottom'],
      control: 'radio',
    },
  },
}

const Filters = () => (
  <Flow direction='vertical'>
    <Text>Show only the orders that match:</Text>
    <Checkbox label='Paid' defaultChecked />
    <Checkbox label='Waiting for payment' />
    <Checkbox label='Shipped' />
    <Checkbox label='Canceled' />
  </Flow>
)

export const Default = (args) => (
  // The page behind the drawer, which also gives the visual test an area to capture
  <div style={{ height: 'calc(100vh - 2rem)' }}>
    <Text component='p'>Orders</Text>
    <Drawer
      open={args.open}
      placement={args.placement}
      title='Filters'
      onClose={action('close')}
      footer={
        <>
          <Button size='small' onClick={action('clear')}>
            Clear
          </Button>
          <Button size='small' kind='primary' onClick={action('apply')}>
            Apply
          </Button>
        </>
      }
    >
      <Filters />
    </Drawer>
  </div>
)

export const Placements = () => {
  // The placement stays when the drawer closes, so it slides out to the edge it came from
  const [placement, setPlacement] = useState<DrawerPlacement>('right')
  const [open, setOpen] = useState(false)

  return (
    <>
      <Flow direction='horizontal'>
        {(['left', 'right', 'top', 'bottom'] as DrawerPlacement[]).map((value) => (
          <Button
            key={value}
            size='small'
            onClick={() => {
              setPlacement(value)
              setOpen(true)
            }}
          >
            Open {value}
          </Button>
        ))}
      </Flow>
      <Drawer open={open} placement={placement} title={`Drawer on the ${placement}`} onClose={() => setOpen(false)}>
        <Filters />
      </Drawer>
    </>
  )
}
