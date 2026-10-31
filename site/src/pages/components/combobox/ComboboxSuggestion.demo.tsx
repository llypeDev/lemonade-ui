import { Combobox, Text, VFlow } from '@lemonade/ui'
import React, { useState } from 'react'

const sizes = ['Small', 'Medium', 'Large']

function ComboboxSuggestionDemo() {
  const [size, setSize] = useState<string>(null)

  return (
    <VFlow style={{ maxWidth: '20rem' }}>
      <Combobox<string>
        label='Size'
        name='size'
        items={sizes}
        itemToString={(item) => item ?? ''}
        createNewItem={(inputValue) => inputValue}
        value={size}
        onChange={setSize}
      />
      <Text color='secondary'>Value: {size ?? 'empty'}</Text>
    </VFlow>
  )
}

export default ComboboxSuggestionDemo
