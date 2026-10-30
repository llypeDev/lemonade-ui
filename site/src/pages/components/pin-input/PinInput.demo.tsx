import { Flow, PinInput, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function PinInputDemo() {
  const [status, setStatus] = useState('')

  return (
    <Flow direction='vertical'>
      <PinInput
        label='Enter the 6-digit code sent to (11) 9••••-4321'
        onChange={() => setStatus('')}
        onComplete={(code) => setStatus(code === '123456' ? 'Code confirmed.' : 'The code is wrong. Try 123456.')}
      />
      <Text role='status'>{status}</Text>
    </Flow>
  )
}

export default PinInputDemo
