import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Heading } from '../Heading'
import { Text } from '../Text'

import { InlineEdit } from './InlineEdit'

export default {
  title: 'Components/InlineEdit',
  component: InlineEdit,
}

export const Default = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <InlineEdit label='Project name' defaultValue='Lemonade website' />
    <InlineEdit label='Description' placeholder='Add a description' />
  </Flow>
)

export const Editing = () => (
  <div style={{ maxWidth: '24rem' }}>
    <InlineEdit label='Project name' defaultValue='Lemonade website' defaultEditing />
  </div>
)

export const WithValidation = () => {
  const [name, setName] = useState('Lemonade website')

  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <Heading level={3} fontWeight='bold'>
        Project
      </Heading>
      <InlineEdit
        label='Project name'
        value={name}
        maxLength={40}
        validate={(value) => (value.trim() ? undefined : 'Enter a name for the project')}
        onSave={(value) => new Promise((resolve) => setTimeout(() => resolve(setName(value)), 800))}
      />
      <Text color='secondary'>Saved name: {name}</Text>
    </Flow>
  )
}

WithValidation.parameters = {
  loki: { skip: true },
}
