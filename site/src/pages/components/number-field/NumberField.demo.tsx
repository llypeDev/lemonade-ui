import { Flow, NumberField, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function NumberFieldDemo() {
  const [tickets, setTickets] = useState<number | null>(2)

  return (
    <Flow direction='vertical' style={{ maxWidth: '12rem' }}>
      <NumberField label='Tickets' value={tickets} onChange={setTickets} min={0} max={8} />
      <Text>Total: {tickets === null ? '-' : `$${tickets * 25}`}</Text>
      <NumberField label='Weight (kg)' defaultValue={2.5} step={0.5} min={0} />
    </Flow>
  )
}

export default NumberFieldDemo
