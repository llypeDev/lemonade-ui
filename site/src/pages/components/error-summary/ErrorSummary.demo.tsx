import { Button, ErrorSummary, ErrorSummaryItem, Flow, TextField } from '@lemonade/ui'
import React, { useState } from 'react'

function ErrorSummaryDemo() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [submits, setSubmits] = useState(0)

  const summary: ErrorSummaryItem[] = [
    errors.name && { fieldId: 'demo-name', message: errors.name },
    errors.email && { fieldId: 'demo-email', message: errors.email },
  ].filter(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({
      name: name.trim() ? undefined : 'Enter your full name',
      email: /^\S+@\S+\.\S+$/.test(email) ? undefined : 'Enter an email address like name@example.com',
    })
    setSubmits(submits + 1)
  }

  return (
    <form noValidate onSubmit={handleSubmit} style={{ maxWidth: '32rem' }}>
      <Flow direction='vertical'>
        <ErrorSummary errors={summary} focusKey={submits} />
        <TextField
          id='demo-name'
          label='Full name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <TextField
          id='demo-email'
          label='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div>
          <Button type='submit' kind='primary'>
            Create account
          </Button>
        </div>
      </Flow>
    </form>
  )
}

export default ErrorSummaryDemo
