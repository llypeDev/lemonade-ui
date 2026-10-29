import { Flow, Slider, Text } from '@lemonade/ui'
import React, { useState } from 'react'

const currency = (value: number) => `R$ ${value}`

function SliderRangeDemo() {
  const [price, setPrice] = useState<[number, number]>([200, 800])
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
        step={50}
        formatValue={currency}
        showLimits
      />
      <Text>
        Showing products from {currency(applied[0])} to {currency(applied[1])}
      </Text>
    </Flow>
  )
}

export default SliderRangeDemo
