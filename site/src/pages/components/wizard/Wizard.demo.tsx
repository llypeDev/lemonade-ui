import { Checkbox, Text, TextField, VFlow, Wizard } from '@lemonade/ui'
import React, { useState } from 'react'

function WizardDemo() {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [terms, setTerms] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [done, setDone] = useState(false)

  if (done) {
    return <Text>Account created for {name}.</Text>
  }

  return (
    <Wizard
      finishLabel='Create account'
      onFinish={() => new Promise((resolve) => setTimeout(resolve, 800)).then(() => setDone(true))}
      steps={[
        {
          id: 'profile',
          title: 'Profile',
          content: (
            <TextField
              label='Name'
              name='name'
              required
              value={name}
              error={nameError}
              onChange={(e) => setName(e.target.value)}
              style={{ maxWidth: '20rem' }}
            />
          ),
          validate: () => {
            setNameError(name.trim() ? '' : 'Enter your name')
            return !!name.trim()
          },
        },
        {
          id: 'plan',
          title: 'Plan',
          content: <Text>The free plan includes 3 projects. You can change it later.</Text>,
        },
        {
          id: 'review',
          title: 'Review',
          content: (
            <VFlow>
              <Text>Name: {name}</Text>
              <Checkbox
                label='I accept the terms of use'
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              {termsError && <Text color='danger'>{termsError}</Text>}
            </VFlow>
          ),
          validate: () => {
            setTermsError(terms ? '' : 'Accept the terms to continue')
            return terms
          },
        },
      ]}
    />
  )
}

export default WizardDemo
