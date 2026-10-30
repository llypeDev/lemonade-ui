import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { Chip } from './Chip'
import { ChipGroup } from './ChipGroup'

export default {
  title: 'Components/Chip',
  component: Chip,
}

export const Default = () => (
  <ChipGroup aria-label='Status' defaultValue={['paid', 'shipped']}>
    <Chip value='paid' count={128}>
      Paid
    </Chip>
    <Chip value='waiting' count={14}>
      Waiting for payment
    </Chip>
    <Chip value='shipped' count={96}>
      Shipped
    </Chip>
    <Chip value='canceled' count={7}>
      Canceled
    </Chip>
    <Chip value='refunded' disabled>
      Refunded
    </Chip>
  </ChipGroup>
)

export const WithIcons = () => (
  <ChipGroup aria-label='Delivery' defaultValue={['express']}>
    <Chip value='express' icon='boxOutline'>
      Express
    </Chip>
    <Chip value='pickup' icon='mapMarkerOutline'>
      Pickup
    </Chip>
    <Chip value='scheduled' icon='calendarOutline'>
      Scheduled
    </Chip>
  </ChipGroup>
)

export const Controlled = () => {
  const [value, setValue] = useState<string[]>(['react'])

  return (
    <Flow direction='vertical'>
      <ChipGroup aria-label='Topics' value={value} onChange={setValue}>
        <Chip value='react'>React</Chip>
        <Chip value='accessibility'>Accessibility</Chip>
        <Chip value='design'>Design</Chip>
      </ChipGroup>
      <Text>Selected: {value.join(', ') || 'none'}</Text>
    </Flow>
  )
}

Controlled.parameters = {
  loki: { skip: true },
}
