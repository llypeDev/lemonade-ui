import { Flow, ProgressCircle, Text } from '@lemonade/ui'
import React from 'react'

function ProgressCircleDemo() {
  return (
    <Flow direction='vertical'>
      <Flow direction='horizontal' alignItems='center'>
        <ProgressCircle value={25} size='small' aria-label='Upload' />
        <ProgressCircle value={60} aria-label='Upload' />
        <ProgressCircle value={90} size='large' type='success' aria-label='Profile completion' />
      </Flow>
      <Flow direction='horizontal' alignItems='center' style={{ gridTemplateColumns: 'auto 1fr' }}>
        <ProgressCircle value={3} max={4} aria-labelledby='profile-steps' />
        <Text id='profile-steps'>3 of 4 steps of your profile done</Text>
      </Flow>
    </Flow>
  )
}

export default ProgressCircleDemo
