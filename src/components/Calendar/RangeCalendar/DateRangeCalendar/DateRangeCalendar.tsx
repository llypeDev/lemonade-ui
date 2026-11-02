import * as React from 'react'

import { Theme } from '../../../../styles'
import { CalendarProps } from '../../Calendar'
import { isSameDay, startOfDay } from '../../util'
import { GenericRangeCalendar } from '../GenericRangeCalendar/GenericRangeCalendar'
import { DateRange } from '../../../DateRangePicker'

export interface DateRangeCalendarProps extends CalendarProps {
  value: DateRange
  minDate?: Date
  maxDate?: Date
  inputOnFocus: number
}

export function DateRangeCalendar({ value, inputOnFocus, maxDate, minDate, ...rest }: DateRangeCalendarProps) {
  // Only the days are compared, so the times are dropped on copies: the dates of the value belong to the caller
  const startDate = value?.startDate && startOfDay(value.startDate)
  const endDate = value?.endDate && startOfDay(value.endDate)

  const handleIsInTheRange = (day: Date): boolean => {
    if (!startDate) {
      if (endDate) {
        return isSameDay(day, endDate)
      } else {
        return false
      }
    }
    if (!endDate) {
      return isSameDay(day, startDate)
    }
    day = startOfDay(day)
    if ((startDate <= day && day <= endDate) || (endDate <= day && day <= startDate)) {
      return true
    }
    return false
  }

  const hoverControl = (day: Date, hoverDate: Date) => {
    day = startOfDay(day)
    hoverDate = startOfDay(hoverDate)

    if (!startDate && !endDate) {
      return isSameDay(day, hoverDate)
    } else if (inputOnFocus) {
      if (!startDate && endDate) {
        if (inputOnFocus === 1) {
          return (endDate < day && hoverDate >= day) || (endDate > day && hoverDate <= day)
        } else {
          return isSameDay(day, hoverDate)
        }
      } else if (startDate && !endDate) {
        if (inputOnFocus === 2) {
          return (startDate < day && hoverDate >= day) || (startDate > day && hoverDate <= day)
        } else {
          return isSameDay(day, hoverDate)
        }
      } else {
        if (inputOnFocus === 1) {
          return (startDate > day && hoverDate <= day) || (endDate < day && isSameDay(day, hoverDate))
        } else if (inputOnFocus === 2) {
          return (endDate < day && hoverDate >= day) || (endDate > day && isSameDay(day, hoverDate))
        }
      }
    }
  }

  // By day, as the disabled modifier does: with minDate={new Date()}, today is clickable, so it is hovered too
  const isInHoverRange = (day: Date, hoverDate: Date) =>
    hoverDate &&
    (!minDate || startOfDay(day) >= startOfDay(minDate)) &&
    (!maxDate || startOfDay(day) <= startOfDay(maxDate)) &&
    hoverControl(day, hoverDate)

  return (
    <GenericRangeCalendar
      {...rest}
      startDate={value?.startDate}
      endDate={value?.endDate}
      isInTheRange={handleIsInTheRange}
      isInTheHoverRange={isInHoverRange}
    />
  )
}

export const dayHoverStyle = (theme: Theme) => ({ background: theme.pallete.surface.background })
