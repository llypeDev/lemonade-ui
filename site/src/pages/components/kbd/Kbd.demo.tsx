import { Flow, Kbd, Text } from '@lemonade/ui'
import React from 'react'

function KbdDemo() {
  return (
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
}

export default KbdDemo
