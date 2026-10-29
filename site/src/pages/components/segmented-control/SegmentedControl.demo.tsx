import { Flow, SegmentedControl, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function SegmentedControlDemo() {
  const [period, setPeriod] = useState('week')

  return (
    <Flow direction='vertical'>
      <SegmentedControl
        aria-label='Period'
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year', disabled: true },
        ]}
      />
      <Text>Showing sales by {period}.</Text>
    </Flow>
  )
}

export default SegmentedControlDemo
