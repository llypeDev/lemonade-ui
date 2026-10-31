import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { TagInput } from './TagInput'

export default {
  title: 'Components/TagInput',
  component: TagInput,
}

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value)

export const Default = () => {
  const [emails, setEmails] = useState(['ana@example.com', 'bruno@example.com'])

  return (
    <Flow direction='vertical' style={{ maxWidth: '28rem' }}>
      <TagInput
        label='Recipients'
        placeholder='Type an email and press Enter'
        value={emails}
        onChange={setEmails}
        validate={isEmail}
      />
      <Text color='secondary'>{emails.length} recipients</Text>
    </Flow>
  )
}

export const States = () => (
  <Flow direction='vertical' style={{ maxWidth: '28rem' }}>
    <TagInput label='Keywords' placeholder='Add keywords' />
    <TagInput label='Recipients' defaultValue={['ana@example.com', 'bruno@']} validate={isEmail} />
    <TagInput label='Tags' defaultValue={['design', 'research']} error='Add at most two tags' required />
    <TagInput label='Labels' defaultValue={['urgent', 'billing']} disabled />
  </Flow>
)

export const Limit = () => (
  <TagInput
    label='Top skills'
    defaultValue={['React', 'TypeScript']}
    max={3}
    separators={[',', ';', ' ']}
    placeholder='Up to 3 skills'
    style={{ maxWidth: '28rem' }}
  />
)
