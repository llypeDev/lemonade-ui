import { Flow, InlineEdit, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function InlineEditDemo() {
  const [name, setName] = useState('Lemonade website')

  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <InlineEdit
        label='Project name'
        value={name}
        maxLength={40}
        validate={(value) => (value.trim() ? undefined : 'Enter a name for the project')}
        // Stands for the request that saves the name
        onSave={(value) => new Promise((resolve) => setTimeout(() => resolve(setName(value)), 800))}
      />
      <InlineEdit label='Description' placeholder='Add a description' />
      <Text color='secondary'>Saved name: {name}</Text>
    </Flow>
  )
}

export default InlineEditDemo
