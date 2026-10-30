import { Flow, Meter } from '@lemonade/ui'
import React from 'react'

const gigabytes = (value: number) => `${value} GB of 10 GB`

function MeterDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <Meter label='Storage' value={3.1} max={10} low={6} high={8.5} optimum={0} formatValue={gigabytes} />
      <Meter label='Storage' value={7.2} max={10} low={6} high={8.5} optimum={0} formatValue={gigabytes} />
      <Meter label='Storage' value={9.6} max={10} low={6} high={8.5} optimum={0} formatValue={gigabytes} />
      <Meter label='Team seats' value={8} max={10} formatValue={(value) => `${value} of 10 seats`} />
    </Flow>
  )
}

export default MeterDemo
