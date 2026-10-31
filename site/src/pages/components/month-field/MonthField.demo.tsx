import { Flow, MonthField, ReferenceMonth, Text } from '@lemonade/ui'
import React, { useState } from 'react'

const format = (month: ReferenceMonth) =>
  month ? new Date(month.year, month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'empty'

function MonthFieldDemo() {
  const [month, setMonth] = useState<ReferenceMonth>({ month: 2, year: 2026 })

  return (
    <Flow direction='vertical' gap={0.5} style={{ maxWidth: '16rem', minHeight: '20rem' }}>
      <MonthField
        label='Reference month'
        name='reference-month'
        value={month}
        onChange={setMonth}
        minMonth={{ month: 0, year: 2025 }}
        maxMonth={{ month: 11, year: 2026 }}
      />
      <Text color='secondary'>Value: {format(month)}</Text>
    </Flow>
  )
}

export default MonthFieldDemo
