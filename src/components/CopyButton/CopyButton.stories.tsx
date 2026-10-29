import React from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { CopyButton } from './CopyButton'

export default {
  title: 'Components/CopyButton',
  component: CopyButton,
}

export const Default = () => (
  <Flow direction='horizontal' alignItems='center'>
    <CopyButton text='npm install @lemonade/ui'>Copy command</CopyButton>
    <CopyButton text='npm install @lemonade/ui' skin='outline'>
      Copy command
    </CopyButton>
    <CopyButton text='npm install @lemonade/ui' kind='primary'>
      Copy command
    </CopyButton>
  </Flow>
)

export const IconOnly = () => (
  <Flow direction='horizontal' alignItems='center'>
    <Text component='code'>LMN-4F7Q-92KD</Text>
    <CopyButton text='LMN-4F7Q-92KD' size='small' skin='ghost' />
  </Flow>
)
