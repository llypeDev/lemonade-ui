import { Flow, PinInput } from '@lemonade/ui'
import React from 'react'

function PinInputTypesDemo() {
  return (
    <Flow direction='vertical'>
      <PinInput label='PIN' length={4} mask />
      <PinInput label='Coupon' type='alphanumeric' length={8} />
      <PinInput label='With error' defaultValue='482199' error='The code is wrong. Check the SMS and try again.' />
    </Flow>
  )
}

export default PinInputTypesDemo
