import { Flow, MonthPicker, ReferenceMonth, Text } from '@lemonade/ui'
import React, { useState } from 'react'

const same = (a: ReferenceMonth, b: ReferenceMonth) => !!a && !!b && a.month === b.month && a.year === b.year

function MonthPickerDemo() {
  const [visibleMonth, setVisibleMonth] = useState<ReferenceMonth>({ month: 0, year: 2026 })
  const [picked, setPicked] = useState<ReferenceMonth>({ month: 4, year: 2026 })

  return (
    <Flow direction='vertical' gap={0.5}>
      <div style={{ width: '16rem' }}>
        <MonthPicker
          visibleMonth={visibleMonth}
          onVisibleMonthChange={setVisibleMonth}
          onMonthClick={setPicked}
          modifiers={{ selected: (month: ReferenceMonth) => same(month, picked) }}
        />
      </div>
      <Text color='secondary'>
        Picked: {new Date(picked.year, picked.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Text>
    </Flow>
  )
}

export default MonthPickerDemo
