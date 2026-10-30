import { Flow, ProgressCircle } from '@lemonade/ui'
import React from 'react'

function ProgressCircleIndeterminateDemo() {
  return (
    <Flow direction='horizontal' alignItems='center'>
      <ProgressCircle size='small' />
      <ProgressCircle />
      <ProgressCircle size='large' />
    </Flow>
  )
}

export default ProgressCircleIndeterminateDemo
