import { Flow, Slider } from '@lemonade/ui'
import React from 'react'

function SliderDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <Slider label='Volume' defaultValue={40} />
      <Slider label='Discount' defaultValue={15} max={50} formatValue={(value) => `${value}%`} showLimits />
      <Slider label='Disabled' defaultValue={30} disabled />
    </Flow>
  )
}

export default SliderDemo
