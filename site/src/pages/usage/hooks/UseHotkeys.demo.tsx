import { Kbd, Text, TextField, useHotkeys, VFlow } from '@lemonade/ui'
import React, { useRef, useState } from 'react'

function UseHotkeysDemo() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(0)

  useHotkeys('/', () => inputRef.current && inputRef.current.focus())
  useHotkeys('mod+s', () => setSaved((count) => count + 1), { enableOnFormFields: true })

  return (
    <VFlow style={{ maxWidth: '24rem' }}>
      <Text>
        Press <Kbd>/</Kbd> to go to the search, and <Kbd keys={['Ctrl', 'S']} /> or <Kbd keys={['⌘', 'S']} /> to save.
      </Text>
      <TextField label='Search' name='hotkeys-search' inputRef={inputRef} />
      <Text color='secondary'>Times saved: {saved}</Text>
    </VFlow>
  )
}

export default UseHotkeysDemo
