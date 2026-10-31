import { Combobox, Flow, Text } from '@lemonade/ui'
import React, { useState } from 'react'

interface Period {
  value: number
  label: string
}

const periods: Period[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' },
]

function ComboboxInlineDemo() {
  const [period, setPeriod] = useState<Period>(periods[1])

  return (
    <Flow direction='horizontal' gap={0.5} alignItems='center' style={{ minHeight: '16rem', alignItems: 'flex-start' }}>
      <Text>Showing orders from</Text>
      <Combobox<Period>
        inline
        items={periods}
        value={period}
        onChange={(item) => item && setPeriod(item)}
        itemToString={(item) => (item ? item.label : '')}
        defaultButtonText='Period'
        searchBoxPlaceholder='Search periods'
      />
    </Flow>
  )
}

export default ComboboxInlineDemo
