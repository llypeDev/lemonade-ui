import { CurrencyField, Text, VFlow } from '@lemonade/ui'
import React, { useState } from 'react'

function CurrencyFieldDemo() {
  const [price, setPrice] = useState<number | null>(1234.56)

  return (
    <VFlow style={{ maxWidth: '20rem' }}>
      <CurrencyField label='Price' name='price' value={price} onChange={setPrice} max={100000} />
      <Text color='secondary'>Value: {price === null ? 'empty' : price}</Text>
    </VFlow>
  )
}

export default CurrencyFieldDemo
