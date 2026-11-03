import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'
import { DateRange } from './BaseDateRangeInput'
import { DateRangePicker } from './DateRangePicker'

const todayMinus10 = new Date(new Date().setDate(new Date().getDate() - 10))
const weekStart = new Date(2020, 11, 13)
const weekEnd = new Date(2021, 0, 9)
const period: DateRange = { startDate: todayMinus10, endDate: new Date() }
const periodWeek: DateRange = { startDate: weekStart, endDate: weekEnd }

export default {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    clearable: true,
    label: 'Text label',
    disabled: false,
    error: '',
    inline: false,
    required: true,
    icon: 'calendarOutline',
    onChange: action('changed'),
  },
}

// The picker is controlled: the story keeps the value, so typing or picking dates changes it
const useRange = (args, initial?: DateRange) => {
  const [range, setRange] = useState<DateRange>(initial)

  const handleChange = (next: DateRange) => {
    setRange(next)
    args.onChange(next)
  }

  return [range, handleChange] as const
}

export const Default = (args) => {
  const [range, handleChange] = useRange(args, period)

  return <DateRangePicker {...args} value={range} onChange={handleChange} />
}

export const MinMaxDate = (args) => {
  const [range, handleChange] = useRange(args)

  return <DateRangePicker {...args} value={range} onChange={handleChange} minDate={todayMinus10} maxDate={new Date()} />
}

export const WeekPicker = (args) => {
  const [range, handleChange] = useRange(args, periodWeek)

  return <DateRangePicker {...args} onlyWeeks value={range} onChange={handleChange} />
}

export const WeekPickerMinMaxDate = (args) => {
  const [range, handleChange] = useRange(args, periodWeek)

  return (
    <DateRangePicker
      {...args}
      minDate={weekStart}
      maxDate={new Date()}
      onlyWeeks
      value={range}
      onChange={handleChange}
    />
  )
}
