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
  const [placement, setPlacement] = useState<DrawerPlacement>()

  return (
    <>
      <Flow direction='horizontal'>
        {(['left', 'right', 'top', 'bottom'] as DrawerPlacement[]).map((value) => (
          <Button key={value} size='small' onClick={() => setPlacement(value)}>
            Open {value}
          </Button>
        ))}
      </Flow>
      <Drawer
        open={!!placement}
        placement={placement}
        title={`Drawer on the ${placement}`}
        onClose={() => setPlacement(undefined)}
      >
        <Filters />
      </Drawer>
    </>
  )
}
