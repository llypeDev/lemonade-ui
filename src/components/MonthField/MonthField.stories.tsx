import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'

import { ReferenceMonth } from '../MonthPicker'

import { MonthField } from './MonthField'
import { MonthInput } from './MonthInput'

const today = new Date()
const value = { month: today.getMonth(), year: today.getFullYear() }

export default {
  title: 'Components/MonthField',
  component: MonthField,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    label: 'Month Field',
    error: '',
    onChange: action('changed'),
    disabled: false,
  },
}

// The field is controlled: the story keeps the value, so typing or picking a month changes it
const useMonth = (args, initial: ReferenceMonth) => {
  const [month, setMonth] = useState<ReferenceMonth>(initial)

  const handleChange = (next: ReferenceMonth) => {
    setMonth(next)
    args.onChange(next)
  }

  return [month, handleChange] as const
}

export const Default = (args) => {
  const [month, handleChange] = useMonth(args, { month: 0, year: 2019 })

  return <MonthField {...args} value={month} onChange={handleChange} />
}

export const MinMax = (args) => {
  const [month, handleChange] = useMonth(args, value)

  return (
    <MonthField
      {...args}
      value={month}
      onChange={handleChange}
      minMonth={{ month: 0, year: 2026 }}
      maxMonth={{ month: 3, year: 2027 }}
    />
  )
}

export const BaseInput = (args) => <MonthInput {...args} />
