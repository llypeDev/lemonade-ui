import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'

import { MonthPicker, ReferenceMonth } from './MonthPicker'

const today = new Date()
const value = { month: today.getMonth(), year: today.getFullYear() }

export default {
  title: 'Components/MonthPicker',
  component: MonthPicker,
}

// The picker is controlled: the story keeps the visible month, so the year buttons and the keyboard change it
export const Default = () => {
  const [visibleMonth, setVisibleMonth] = useState<ReferenceMonth>(value)

  const handleVisibleMonthChange = (month: ReferenceMonth) => {
    setVisibleMonth(month)
    action('changed')(month)
  }

  return <MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={handleVisibleMonthChange} />
}
