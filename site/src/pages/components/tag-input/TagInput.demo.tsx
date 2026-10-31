import { Flow, TagInput, Text } from '@lemonade/ui'
import React, { useState } from 'react'

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value)

function TagInputDemo() {
  const [emails, setEmails] = useState(['ana@example.com'])
  const invalid = emails.filter((email) => !isEmail(email)).length

  return (
    <Flow direction='vertical' style={{ maxWidth: '28rem' }}>
      <TagInput
        label='Invite people'
        placeholder='Type or paste emails'
        value={emails}
        onChange={setEmails}
        validate={isEmail}
        error={invalid > 0 ? 'Remove or fix the emails marked in red' : undefined}
      />
      <Text color='secondary'>{emails.length} emails</Text>
    </Flow>
  )
}

export default TagInputDemo
