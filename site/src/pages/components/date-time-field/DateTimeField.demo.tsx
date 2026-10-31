import { DateTimeField, Flow, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function DateTimeFieldDemo() {
  const [value, setValue] = useState<Date | null>(null)
  const today = new Date()

  return (
    <Flow direction='vertical' style={{ maxWidth: '22rem', minHeight: '20rem' }}>
      <DateTimeField label='Appointment' value={value} onChange={setValue} minDate={today} required />
      <Text color='secondary'>{value ? `Value: ${value.toString()}` : 'Pick a day and type a time'}</Text>
    </Flow>
  )
}

export default DateTimeFieldDemo
