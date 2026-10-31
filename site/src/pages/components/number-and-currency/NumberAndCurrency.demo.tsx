import { Currency, DescriptionList, Number } from '@lemonade/ui'
import React from 'react'

function NumberAndCurrencyDemo() {
  return (
    <DescriptionList
      items={[
        { term: 'Orders', description: <Number value={1234567} /> },
        { term: 'Visits', description: <Number value={1234567} abbrev /> },
        {
          term: 'Conversion',
          description: <Number value={0.0345} formatOptions={{ style: 'percent', minimumFractionDigits: 1 }} />,
        },
        { term: 'Weight', description: <Number value={2.5} suffix=' kg' /> },
        { term: 'Revenue', description: <Currency value={48250.9} currency='BRL' /> },
        { term: 'Revenue in dollars', description: <Currency value={9650.18} currency='USD' /> },
        { term: 'Refunds', description: <Number value={null} placeholder='None yet' /> },
      ]}
    />
  )
}

export default NumberAndCurrencyDemo
