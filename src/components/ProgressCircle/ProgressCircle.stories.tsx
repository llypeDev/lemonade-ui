import React from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { ProgressCircle } from './ProgressCircle'

export default {
  title: 'Components/ProgressCircle',
  component: ProgressCircle,
}

export const Default = () => (
  <Flow direction='horizontal' alignItems='center'>
    <ProgressCircle value={25} size='small' aria-label='Upload' />
    <ProgressCircle value={60} aria-label='Upload' />
    <ProgressCircle value={90} size='large' type='success' aria-label='Profile completion' />
  </Flow>
)

export const WithText = () => (
  <Flow direction='horizontal' alignItems='center' style={{ gridTemplateColumns: 'auto 1fr' }}>
    <ProgressCircle value={3} max={4} aria-labelledby='profile-progress' />
    <Text id='profile-progress'>3 of 4 steps of your profile done</Text>
  </Flow>
)

export const Indeterminate = () => (
  <Flow direction='horizontal' alignItems='center'>
    <ProgressCircle size='small' />
    <ProgressCircle />
    <ProgressCircle size='large' />
  </Flow>
)

// The spin never stops, so the visual tests skip it
Indeterminate.parameters = {
  loki: { skip: true },
}
