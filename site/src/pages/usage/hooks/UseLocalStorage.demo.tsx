import { Switch, Text, useLocalStorage, VFlow } from '@lemonade/ui'
import React from 'react'

function UseLocalStorageDemo() {
  const [compact, setCompact] = useLocalStorage('docs-compact-rows', false)

  return (
    <VFlow>
      <Switch label='Compact rows' checked={compact} onChange={(e) => setCompact(e.target.checked)} />
      <Text color='secondary'>Reload the page: the choice stays in this browser.</Text>
    </VFlow>
  )
}

export default UseLocalStorageDemo
