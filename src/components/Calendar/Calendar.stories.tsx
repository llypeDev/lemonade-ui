import { action } from '@storybook/addon-actions'
import React, { useEffect, useState } from 'react'

import { Calendar } from './Calendar'
import { createWeekArray, isSameDay } from './util'

const isCurrentWeek = (day: Date) => {
  const week = createWeekArray(new Date())
  return week.find((d) => isSameDay(d, day)) !== undefined
}

const isOddDay = (day: Date) => day.getDate() % 2 === 1

export default {
  title: 'Components/Calendar',
  component: Calendar,
  argTypes: {
    visibleDate: { control: 'date' },
  },
  args: {
    visibleDate: new Date(),
    onVisibleDateChange: action('onVisibleDateChange'),
    onDayClick: action('onDayClick'),
    onDayHover: action('onDayHover'),
  },
}

// The calendar is controlled: the story keeps the visible month, so the month and year buttons and the keyboard
// change it, and the control of the visibleDate arg still sets it
const useVisibleDate = (args) => {
  const argTime = new Date(args.visibleDate).getTime()
  const [visibleDate, setVisibleDate] = useState(() => new Date(argTime))
  useEffect(() => setVisibleDate(new Date(argTime)), [argTime])

  const handleVisibleDateChange = (date: Date) => {
    setVisibleDate(date)
    args.onVisibleDateChange(date)
  }

  return [visibleDate, handleVisibleDateChange] as const
}

export const Default = (args) => {
  const [visibleDate, handleVisibleDateChange] = useVisibleDate(args)
  const [selectedDay, setSelectedDay] = useState(() => new Date())

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    args.onDayClick(day)
  }

  return (
    <Calendar
      {...args}
      visibleDate={visibleDate}
      onVisibleDateChange={handleVisibleDateChange}
      onDayClick={handleDayClick}
      modifiers={{
        selected: (day: Date) => isSameDay(day, selectedDay),
      }}
    />
  )
}

export const DisabledDates = (args) => {
  const [visibleDate, handleVisibleDateChange] = useVisibleDate(args)

  return (
    <Calendar
      {...args}
      visibleDate={visibleDate}
      onVisibleDateChange={handleVisibleDateChange}
      modifiers={{
        disabled: (day) => !isCurrentWeek(day),
      }}
    />
  )
}

export const CustomModifier = (args) => {
  const [visibleDate, handleVisibleDateChange] = useVisibleDate(args)

  return (
    <Calendar
      {...args}
      visibleDate={visibleDate}
      onVisibleDateChange={handleVisibleDateChange}
      modifiers={{
        oddDays: isOddDay,
      }}
      modifierStyles={{
        today: (theme) => ({ background: theme.pallete.status.danger.background }),
        oddDays: (theme) => ({ color: theme.pallete.status.danger.main, fontWeight: 'bold' }),
      }}
    />
  )
}
