import { Flow, Kbd, Text } from '@lemonade/ui'
import React from 'react'

function KbdDemo() {
  return (
    <Flow direction='vertical'>
      <Text component='p'>
        Press <Kbd keys={['Ctrl', 'K']} /> to search, or <Kbd>Esc</Kbd> to close.
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <Kbd keys={['Ctrl', 'Shift', 'P']} />
        <Kbd keys={['⌘', 'K']} separator='' />
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        <Kbd>Enter</Kbd>
      </div>
    </Flow>
  )
}

export default KbdDemo
