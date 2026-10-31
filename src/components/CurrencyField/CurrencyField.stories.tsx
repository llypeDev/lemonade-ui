import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { CurrencyField } from './CurrencyField'

export default {
  title: 'Components/CurrencyField',
  component: CurrencyField,
}

export const Default = () => {
  const [price, setPrice] = useState<number | null>(1234.56)

  return (
    <Flow direction='vertical' style={{ maxWidth: '20rem' }}>
      <CurrencyField label='Price' value={price} onChange={setPrice} required />
      <Text color='secondary'>Value: {price === null ? 'empty' : price}</Text>
    </Flow>
  )
}

export const States = () => (
  <Flow direction='vertical' style={{ maxWidth: '20rem' }}>
    <CurrencyField label='Discount' />
    <CurrencyField label='Balance' defaultValue={-250.5} allowNegative />
    <CurrencyField label='Monthly fee' defaultValue={19.9} error='The fee must be at least R$ 29,90' />
    <CurrencyField
      label='Price in dollars'
      defaultValue={1999.9}
      currency='US$'
      decimalSeparator='.'
      thousandsSeparator=','
    />
    <CurrencyField label='Paid' defaultValue={320} disabled />
  </Flow>
)
