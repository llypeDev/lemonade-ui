import React, { useState } from 'react'

import { Button } from '../Button'
import { Fieldset } from '../Fieldset'
import { Flow } from '../Flow'
import { Radio } from '../Radio'
import { TextField } from '../TextField'

import { ErrorSummary, ErrorSummaryItem } from './ErrorSummary'

export default {
  title: 'Components/ErrorSummary',
  component: ErrorSummary,
}

export const Default = () => (
  <ErrorSummary
    autoFocus={false}
    errors={[
      { fieldId: 'name', message: 'Enter your full name' },
      { fieldId: 'email', message: 'Enter an email address in the correct format, like name@example.com' },
      { fieldId: 'plan', message: 'Choose a plan' },
    ]}
    style={{ maxWidth: '36rem' }}
  />
)

export const WithDescription = () => (
  <ErrorSummary
    autoFocus={false}
    title='The order was not sent'
    description='Fix the errors below and send it again.'
    errors={[
      { fieldId: 'zip', message: 'Enter a ZIP code with 8 digits' },
      { message: 'The payment service did not answer. Try again in a few minutes.' },
    ]}
    style={{ maxWidth: '36rem' }}
  />
)

interface Values {
  name: string
  email: string
  plan: string
}

const validate = (values: Values) => {
  const errors: Partial<Record<keyof Values, string>> = {}
  if (!values.name.trim()) {
    errors.name = 'Enter your full name'
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter an email address in the correct format, like name@example.com'
  }
  if (!values.plan) {
    errors.plan = 'Choose a plan'
  }
  return errors
}

export const Form = () => {
  const [values, setValues] = useState<Values>({ name: '', email: '', plan: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [submits, setSubmits] = useState(0)
  const [sent, setSent] = useState(false)

  const summary: ErrorSummaryItem[] = (Object.keys(errors) as Array<keyof Values>).map((field) => ({
    fieldId: field,
    message: errors[field],
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate(values)
    setErrors(next)
    setSubmits((count) => count + 1)
    setSent(Object.keys(next).length === 0)
  }

  const set = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [field]: e.target.value })

  return (
    <form noValidate onSubmit={handleSubmit} style={{ maxWidth: '36rem' }}>
      <Flow direction='vertical'>
        <ErrorSummary errors={summary} focusKey={submits} />
        {sent && <p role='status'>Thanks! Your account was created.</p>}
        <TextField id='name' label='Full name' value={values.name} onChange={set('name')} error={errors.name} />
        <TextField id='email' label='Email' value={values.email} onChange={set('email')} error={errors.email} />
        <Fieldset id='plan' legend='Plan' error={errors.plan}>
          <Radio name='plan' label='Basic' value='basic' checked={values.plan === 'basic'} onChange={set('plan')} />
          <Radio name='plan' label='Pro' value='pro' checked={values.plan === 'pro'} onChange={set('plan')} />
        </Fieldset>
        <div>
          <Button type='submit' kind='primary'>
            Create account
          </Button>
        </div>
      </Flow>
    </form>
  )
}

Form.parameters = {
  // The summary shows only after a submit
  loki: { skip: true },
}
