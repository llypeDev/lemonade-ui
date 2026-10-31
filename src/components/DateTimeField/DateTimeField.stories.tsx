import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { DateTimeField } from './DateTimeField'

export default {
  title: 'Components/DateTimeField',
  component: DateTimeField,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '320px', maxWidth: '22rem' }}>
        <Story />
      </div>
    ),
  ],
}

export const Default = () => {
  const [value, setValue] = useState<Date | null>(new Date(2024, 4, 10, 14, 30))

  return (
    <Flow direction='vertical'>
      <DateTimeField label='Appointment' value={value} onChange={setValue} required />
      <Text color='secondary'>
        Value: {value ? value.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' } as any) : 'none'}
      </Text>
    </Flow>
  )
}

export const States = () => (
  <Flow direction='vertical'>
    <DateTimeField label='Starts at' />
    <DateTimeField label='Ends at' value={new Date(2024, 4, 10, 9, 0)} error='Pick a time after the start' />
    <DateTimeField label='Created at' value={new Date(2024, 4, 10, 9, 0)} disabled />
  </Flow>
)

export const MinAndMax = () => {
  const today = new Date()
  const inTwoWeeks = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)

  return <DateTimeField label='Delivery' minDate={today} maxDate={inTwoWeeks} />
}
