import { Text, TextField, useDebounce, VFlow } from '@lemonade/ui'
import React, { useState } from 'react'

function UseDebounceDemo() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  return (
    <VFlow style={{ maxWidth: '20rem' }}>
      <TextField label='Search' name='search' value={search} onChange={(e) => setSearch(e.target.value)} />
      <Text color='secondary'>Searching for: {debouncedSearch || 'nothing yet'}</Text>
    </VFlow>
  )
}

export default UseDebounceDemo
