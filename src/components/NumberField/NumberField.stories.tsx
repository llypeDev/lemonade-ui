import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { NumberField } from './NumberField'

export default {
  title: 'Components/NumberField',
  component: NumberField,
}

export const Default = () => (
  <Flow direction='vertical' style={{ maxWidth: '12rem' }}>
    <NumberField label='Quantity' defaultValue={1} min={1} max={10} />
    <NumberField label='Weight (kg)' defaultValue={2.5} step={0.5} min={0} />
  </Flow>
)

export const States = () => (
  <Flow direction='vertical' style={{ maxWidth: '12rem' }}>
    <NumberField label='Seats' defaultValue={12} max={10} error='The room has 10 seats.' />
    <NumberField label='Disabled' defaultValue={3} disabled />
  </Flow>
)

export const Controlled = () => {
  const [value, setValue] = useState<number | null>(2)

  return (
    <Flow direction='vertical' style={{ maxWidth: '12rem' }}>
      <NumberField label='Tickets' value={value} onChange={setValue} min={0} max={8} />
      <Text>Total: {value === null ? '-' : `$${value * 25}`}</Text>
    </Flow>
  )
}

Controlled.parameters = {
  loki: { skip: true },
}
