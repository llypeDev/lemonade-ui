import React from 'react'

import { Flow } from '../Flow'

import { PasswordField } from './PasswordField'

export default {
  title: 'Components/PasswordField',
  component: PasswordField,
}

export const Default = () => (
  <Flow direction='vertical' style={{ maxWidth: '20rem' }}>
    <PasswordField label='Password' name='password' />
    <PasswordField label='Visible password' name='visible' defaultVisible defaultValue='lemonade-2026' />
  </Flow>
)

export const NewPassword = () => (
  <div style={{ maxWidth: '20rem' }}>
    <PasswordField
      label='New password'
      name='new-password'
      autoComplete='new-password'
      required
      defaultValue='short'
      error='Use at least 8 characters.'
    />
  </div>
)

export const Disabled = () => (
  <div style={{ maxWidth: '20rem' }}>
    <PasswordField label='Password' defaultValue='secret' disabled />
  </div>
)
