import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { Slider } from './Slider'

export default {
  title: 'Components/Slider',
  component: Slider,
}

const currency = (value: number) => `R$ ${value}`

export const Default = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <Slider label='Volume' defaultValue={40} />
    <Slider label='Discount' defaultValue={15} max={50} formatValue={(v) => `${v}%`} showLimits />
    <Slider label='Opacity' defaultValue={0.6} min={0} max={1} step={0.1} />
  </Flow>
)

export const Range = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <Slider label='Price' defaultValue={[200, 800]} min={0} max={1000} step={50} formatValue={currency} showLimits />
    <Slider label='Age' defaultValue={[18, 65]} min={0} max={100} />
  </Flow>
)

export const States = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <Slider label='Disabled' defaultValue={30} disabled />
    <Slider label='With error' defaultValue={5} error='Pick a value above 10' />
    <Slider aria-label='Without label' defaultValue={70} showValue={false} />
  </Flow>
)

export const Controlled = () => {
  const [price, setPrice] = useState<[number, number]>([100, 600])
  const [applied, setApplied] = useState(price)

  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <Slider
        label='Price'
        value={price}
        onChange={setPrice}
        onChangeEnd={setApplied}
        min={0}
        max={1000}
        step={10}
        formatValue={currency}
      />
      <Text>
        Filter applied: {currency(applied[0])} to {currency(applied[1])}
      </Text>
    </Flow>
  )
}

Controlled.parameters = {
  loki: { skip: true },
}
