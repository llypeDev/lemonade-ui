import React from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { Kbd } from './Kbd'

export default {
  title: 'Components/Kbd',
  component: Kbd,
}

export const Default = () => (
  <Flow direction='vertical'>
    <Text component='p'>
      Press <Kbd keys={['Ctrl', 'K']} /> to search, or <Kbd>Esc</Kbd> to close.
    </Text>
    <Flow direction='horizontal' alignItems='center'>
      <Kbd keys={['Ctrl', 'Shift', 'P']} />
      <Kbd keys={['⌘', 'K']} separator='' />
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>Enter</Kbd>
    </Flow>
  </Flow>
)
