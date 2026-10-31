import { Flow, SortableList, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function SortableListDemo() {
  const [steps, setSteps] = useState(['Collect the requirements', 'Draw the screens', 'Build', 'Test', 'Release'])

  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <SortableList aria-label='Project steps' items={steps} onChange={setSteps} />
      <Text color='secondary'>Order: {steps.join(', ')}</Text>
    </Flow>
  )
}

export default SortableListDemo
