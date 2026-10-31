import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Radio } from '../Radio'
import { Text } from '../Text'
import { TextField } from '../TextField'

import { Wizard } from './Wizard'

export default {
  title: 'Components/Wizard',
  component: Wizard,
}

export const Default = () => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [plan, setPlan] = useState('basic')
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <Text component='p'>
        Account created for {email} on the {plan} plan.
      </Text>
    )
  }

  return (
    <div style={{ maxWidth: '40rem' }}>
      <Wizard
        finishLabel='Create account'
        onFinish={() => setDone(true)}
        steps={[
          {
            id: 'account',
            title: 'Account',
            validate: () => {
              const valid = /^\S+@\S+\.\S+$/.test(email)
              setEmailError(valid ? undefined : 'Enter an email address like name@example.com')
              return valid
            },
            content: (
              <TextField
                label='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                required
              />
            ),
          },
          {
            id: 'plan',
            title: 'Plan',
            content: (
              <Flow direction='vertical' gap={0.5}>
                <Radio name='plan' label='Basic, free' checked={plan === 'basic'} onChange={() => setPlan('basic')} />
                <Radio
                  name='plan'
                  label='Pro, R$ 49 a month'
                  checked={plan === 'pro'}
                  onChange={() => setPlan('pro')}
                />
              </Flow>
            ),
          },
          {
            id: 'review',
            title: 'Review',
            content: (
              <Text component='p'>
                You are creating an account for {email || 'no email yet'} on the {plan} plan.
              </Text>
            ),
          },
        ]}
      />
    </div>
  )
}
