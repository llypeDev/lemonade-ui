import { Flow, Text, TimeField } from '@lemonade/ui'
import React, { useState } from 'react'

function TimeFieldDemo() {
  const [time, setTime] = useState('09:30')

  return (
    <Flow direction='vertical' gap={0.5} style={{ maxWidth: '12rem' }}>
      <TimeField label='Start time' name='start' value={time} onChange={(value) => setTime(value || '')} />
      <Text color='secondary'>Value: {time || 'empty'}</Text>
    </Flow>
  )
}

export default TimeFieldDemo
