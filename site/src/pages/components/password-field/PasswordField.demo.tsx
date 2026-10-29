import { Flow, PasswordField } from '@lemonade/ui'
import React from 'react'

function PasswordFieldDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '20rem' }}>
      <PasswordField label='Password' name='password' />
      <PasswordField label='New password' name='new-password' autoComplete='new-password' required />
    </Flow>
  )
}

export default PasswordFieldDemo
