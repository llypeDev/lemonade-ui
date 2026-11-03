import { Options as PopperOptions } from '@popperjs/core'
import React, { useEffect, useRef, useState } from 'react'

import { usePopper } from 'react-popper'
import { Theme, useStyles } from '../../styles'
import { composeHandlers, composeRefs } from '../../util/react'

import { focusTabbableDay } from '../Calendar/Calendar'
import { usePickerPopup } from '../Calendar/usePickerPopup'
import { isValidDate } from '../Calendar/util'
import { disableByRange } from '../DateField/DateField'
import { FocusManagerContainer } from '../FocusManagerContainer'
import { IconImage } from '../Icon'

import {
  ControlledDateRangeCalendarProps,
  ControlledDateRangeCalendar,
} from '../Calendar/RangeCalendar/DateRangeCalendar/ControlledDateRangeCalendar'
import { DateRange } from './BaseDateRangeInput'
import { DateRangePickerInput, DateRangePickerInputProps } from './DateRangePickerInput'

export interface DateRangePickerProps extends DateRangePickerInputProps {
  minDate?: Date
  maxDate?: Date
  icon?: IconImage
  calendarProps?: Partial<ControlledDateRangeCalendarProps>
  popperProps?: PopperOptions
  onFocus?(e: React.FocusEvent<HTMLDivElement>): void
  onBlur?(e: React.FocusEvent<HTMLDivElement>): void
  onlyWeeks?: boolean
}

export interface Week {
  start: Date
  end: Date
}

export function DateRangePicker(props: DateRangePickerProps) {
  const {
    onChange,
    popperProps,
    minDate,
    maxDate,
    value,
    icon,
    calendarProps,
    onFocus,
    onBlur,
    onlyWeeks,
    onIconClick,
    onInputClick,
    onInputKeyDown,
    initialInputRef: externalInitialInputRef,
    finalInputRef: externalFinalInputRef,
    ...rest
  } = props

  const [dateRangeInputFocus, setDateRangeInputFocus] = useState(1)
  const [visibleDate, setVisibleDate] = useState<Date>(new Date())

  const { classes, css } = useStyles(createStyles)

  const initialInputRef = useRef<HTMLInputElement>()
  const finalInputRef = useRef<HTMLInputElement>()
  const [anchorRef, setAnchorRef] = useState<HTMLDivElement>()
  const [popupRef, setPopupRef] = useState<HTMLDivElement>()

  const { open, setOpen, handleInputKeyDown } = usePickerPopup({
    popup: popupRef,
    focusTabStop: focusTabbableDay,
    // The input of the date that the calendar picks
    getInput: () => (dateRangeInputFocus === 2 ? finalInputRef.current : initialInputRef.current),
    isOwnElement: (element) => !!anchorRef?.contains(element),
  })

  useEffect(() => {
    const point = (): Date => {
      if (dateRangeInputFocus === 1 && value?.startDate) {
        return value.startDate
      } else if (dateRangeInputFocus === 2 && value?.endDate) {
        return value.endDate
      } else if (value?.startDate && !value?.endDate) {
        return value.startDate
      } else if (!value?.startDate && value?.endDate) {
        return value.endDate
      } else {
        return new Date()
      }
    }

    // The calendar cannot show the month of an invalid date
    setVisibleDate(() => {
      const date = point()
      return isValidDate(date) ? date : new Date()
    })
    // Each time the calendar opens or closes, it goes back to the month of the value
  }, [dateRangeInputFocus, value, open])

  // The placement of popperProps wins over the default one
  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(anchorRef, popupRef, { placement: 'bottom', ...popperProps })

  const isOutOfRange = onlyWeeks ? disableByWeekRange(minDate, maxDate) : disableByRange(minDate, maxDate)

  const handleInputFocus = (inputOnFocus: number) => setDateRangeInputFocus(inputOnFocus)

  const handleOnDayClick = () => finalInputRef.current.focus()

  // The focus alone does not open the calendar, which would cover the next fields while Tab goes through a form
  const handleFocusIn = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus && onFocus(event)
  }

  const handleInputClick = () => setOpen(true)

  // As before, the calendar button moves the focus to the first input, unless onIconClick does something else
  const handleIconClick = () => {
    setOpen(true)
    if (onIconClick) {
      onIconClick()
    } else {
      initialInputRef.current?.focus()
    }
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    onBlur && onBlur(event)
    setOpen(false)
  }

  const handleDateRangeChanged = (rangeDateFromBaseInput: DateRange) => {
    onChange(rangeDateFromBaseInput)
  }

  const handleCalendarDateRangeChanged = (dateRange: DateRange) => {
    const { startDate, endDate } = dateRange
    startDate && endDate
      ? startDate <= endDate
        ? onChange({ startDate: startDate, endDate: endDate } as DateRange)
        : onChange({ startDate: endDate, endDate: startDate } as DateRange)
      : onChange({ startDate: startDate, endDate: endDate } as DateRange)
  }

  const handleOnVisibleDateChange = (vDate: Date): void => setVisibleDate(vDate)
  return (
    <FocusManagerContainer onFocusIn={handleFocusIn} onFocusOut={handleFocusOut}>
      <DateRangePickerInput
        value={value}
        onChange={handleDateRangeChanged}
        divRef={setAnchorRef}
        minDate={minDate}
        maxDate={maxDate}
        icon={icon}
        initialInputRef={composeRefs(initialInputRef, externalInitialInputRef)}
        finalInputRef={composeRefs(finalInputRef, externalFinalInputRef)}
        onInputOnFocus={handleInputFocus}
        onIconClick={handleIconClick}
        onInputClick={composeHandlers(handleInputClick, onInputClick)}
        onInputKeyDown={composeHandlers(handleInputKeyDown, onInputKeyDown)}
        {...rest}
      />

      {open && (
        <div
          ref={setPopupRef}
          className={css(classes.root, popperStyle as any)}
          data-placement={popperAttributes?.['data-popper-placement']}
          tabIndex={-1}
        >
          <ControlledDateRangeCalendar
            value={value}
            onChange={handleCalendarDateRangeChanged}
            onDayClick={handleOnDayClick}
            inputOnFocus={dateRangeInputFocus}
            visibleDate={visibleDate}
            onVisibleDateChange={handleOnVisibleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            onlyWeeks={onlyWeeks}
            {...calendarProps}
            // Merged, so that other modifiers of calendarProps do not remove this one
            modifiers={{
              ...calendarProps?.modifiers,
              // calendarProps may disable more dates, but never enable those out of minDate and maxDate
              disabled: (element, monthViewProps) =>
                isOutOfRange(element) || !!calendarProps?.modifiers?.disabled?.(element, monthViewProps),
            }}
          />
        </div>
      )}
    </FocusManagerContainer>
  )
}

DateRangePicker.defaultProps = {
  onlyWeeks: false,
  icon: 'calendarOutline',
} as Partial<DateRangePickerProps>

export const disableByWeekRange = (minDate: Date, maxDate: Date) => {
  const realMinDate = new Date(minDate)
  realMinDate.setHours(0, 0, 0, 0)

  const realMaxDate = new Date(maxDate)
  realMaxDate.setHours(23, 59, 59, 999)

  return (week: Week) => {
    return (minDate && week.start < realMinDate) || (maxDate && week.end > realMaxDate)
  }
}

export const createStyles = (theme: Theme) => ({
  root: {
    zIndex: theme.zIndex.popper,
    background: theme.pallete.surface.main,
    boxShadow: theme.shadows.outer[40],
    borderRadius: theme.radius.popper,
    padding: '0.5rem .25rem .25rem .25rem',
    outline: 'none',
  },
})
