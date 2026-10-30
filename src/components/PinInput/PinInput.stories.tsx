import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { PinInput } from './PinInput'

export default {
  title: 'Components/PinInput',
  component: PinInput,
}

export const Default = () => (
  <Flow direction='vertical'>
    <PinInput label='Verification code' defaultValue='4821' />
    <PinInput label='PIN' length={4} defaultValue='12' mask />
    <PinInput label='Coupon' type='alphanumeric' length={8} defaultValue='LEMON' />
  </Flow>
)

export const States = () => (
  <Flow direction='vertical'>
    <PinInput label='With error' defaultValue='482199' error='The code is wrong. Check the SMS and try again.' />
    <PinInput label='Disabled' defaultValue='4821' disabled />
  </Flow>
)

export const Verification = () => {
  const [status, setStatus] = useState('')

  return (
    <Flow direction='vertical'>
      <PinInput
        label='Enter the 6-digit code sent to (11) 9••••-4321'
        autoFocus
        onChange={() => setStatus('')}
        onComplete={(code) => setStatus(code === '123456' ? 'Code confirmed.' : 'The code is wrong.')}
      />
      <Text role='status'>{status}</Text>
    </Flow>
  )
}

Verification.parameters = {
  loki: { skip: true },
}
