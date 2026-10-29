import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { SegmentedControl, SegmentedControlOption } from './SegmentedControl'

export default {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
}

const periods: SegmentedControlOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year', disabled: true },
]

export const Default = () => (
  <Flow direction='vertical'>
    <SegmentedControl aria-label='Period' options={periods} defaultValue='week' />
    <SegmentedControl aria-label='Period' options={periods} defaultValue='day' size='small' />
  </Flow>
)

export const WithIcons = () => (
  <SegmentedControl
    aria-label='View'
    options={[
      { value: 'list', label: 'List', icon: 'list' },
      { value: 'calendar', label: 'Calendar', icon: 'calendarOutline' },
    ]}
  />
)

export const Block = () => (
  <div style={{ maxWidth: '24rem' }}>
    <SegmentedControl
      aria-label='Plan'
      block
      options={[
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
      ]}
    />
  </div>
)

export const Controlled = () => {
  const [period, setPeriod] = useState('month')

  return (
    <Flow direction='vertical'>
      <SegmentedControl aria-label='Period' options={periods} value={period} onChange={setPeriod} />
      <Text>Showing sales by {period}.</Text>
    </Flow>
  )
}

Controlled.parameters = {
  loki: { skip: true },
}
