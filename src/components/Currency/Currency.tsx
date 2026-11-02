import React from 'react'

import { Number, NumberProps } from '../Number/Number'

export interface CurrencyProps extends NumberProps {
  currency?: string
}

export function Currency(props: CurrencyProps) {
  const { currency, formatOptions, ...rest } = props
  return <Number {...rest} formatOptions={{ style: 'currency', currency, ...formatOptions }} />
}

Currency.defaultProps = {
  currency: 'USD',
} as Partial<CurrencyProps>
