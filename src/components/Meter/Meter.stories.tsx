import React from 'react'

import { Flow } from '../Flow'

import { Meter } from './Meter'

export default {
  title: 'Components/Meter',
  component: Meter,
}

const gigabytes = (value: number) => `${value.toLocaleString('en')} GB of 10 GB`

export const Default = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <Meter label='Monthly quota' value={45} />
    <Meter label='Team seats' value={8} max={10} formatValue={(v) => `${v} of 10 seats`} />
  </Flow>
)

export const Thresholds = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <Meter label='Storage' value={3.1} max={10} low={6} high={8.5} optimum={0} formatValue={gigabytes} />
    <Meter label='Storage' value={7.2} max={10} low={6} high={8.5} optimum={0} formatValue={gigabytes} />
    <Meter label='Storage' value={9.6} max={10} low={6} high={8.5} optimum={0} formatValue={gigabytes} />
    <Meter label='Battery' value={15} low={20} high={80} optimum={100} />
  </Flow>
)
