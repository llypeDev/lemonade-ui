import { Options as PopperOptions } from '@popperjs/core'
import React, { useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import { useLocale } from '../../i18n'
import { Theme } from '../../styles'
import { useStyles } from '../../styles/hooks/useStyles'
import { composeHandlers, composeRefs } from '../../util/react'
import { Calendar, CalendarProps } from '../Calendar'
import { focusTabbableDay } from '../Calendar/Calendar'
import { usePickerPopup } from '../Calendar/usePickerPopup'
import { isSameDay, isValidDate } from '../Calendar/util'
import { FocusManagerContainer } from '../FocusManagerContainer'
import { DateInput, DateInputProps } from './DateInput'

export interface DateFieldProps extends DateInputProps {
  /**
   * Minimum date that can be selected in the calendar
   */
  minDate?: Date

  /**
   * Maximum date that can be selected in the calendar.
   */
  maxDate?: Date

  /**
   * Props delegated to the Calendar
   */
  calendarProps?: Partial<CalendarProps>

  /**
   * Props delegated to the Popper instance
   */
  popperProps?: PopperOptions
}

export function DateField(props: DateFieldProps) {
  const {
    calendarProps,
    popperProps,
    minDate,
    maxDate,
    value,
    onClick,
    onKeyDown,
    icon,
    iconRef,
    onIconClick,
    ...rest
  } = props

  const { css, classes } = useStyles(createStyles)
  const locale = useLocale()

  const [inputRef, setInputRef] = useState<HTMLInputElement>()
  const [popupRef, setPopupRef] = useState<HTMLDivElement>()
  const [iconButton, setIconButton] = useState<HTMLButtonElement>()

  const { open, setOpen, handleInputKeyDown } = usePickerPopup({
    popup: popupRef,
    focusTabStop: focusTabbableDay,
    getInput: () => inputRef,
    isOwnElement: (element) => !!iconButton?.contains(element),
  })

  // Each time the calendar opens or closes, it goes back to the month of the value
  const [visibleDate, setVisibleDate] = useState(new Date())
  useEffect(() => {
    setVisibleDate(isValidDate(value) ? value : new Date())
  }, [value, open])

  // The placement of popperProps wins over the default one
  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(inputRef, popupRef, { placement: 'bottom-start', ...popperProps })

  const isOutOfRange = disableByRange(minDate, maxDate)

  const handleDayClick = (day: Date) => {
    inputRef.focus()
    setOpen(false)
    return props.onChange(day)
  }

  // The focus alone does not open the calendar, which would cover the next fields while Tab goes through a form
  const handleInputClick = () => setOpen(true)
  const handleInputIconClick = () => setOpen(true)
  const handleFocusOut = () => setOpen(false)

  const handleVisibleDateChange = (newVisibleDate: Date) => setVisibleDate(newVisibleDate)

  return (
    <FocusManagerContainer onFocusOut={handleFocusOut}>
      <DateInput
        inputRef={setInputRef}
        value={value}
        icon={icon}
        iconRef={composeRefs(setIconButton, iconRef)}
        iconAriaLabel={locale.calendar.open}
        onIconClick={composeHandlers(handleInputIconClick, onIconClick)}
        onClick={composeHandlers(handleInputClick, onClick)}
        onKeyDown={composeHandlers(handleInputKeyDown, onKeyDown)}
        {...rest}
      />

      {open && (
        <div
          ref={setPopupRef}
          className={css(classes.root, popperStyle as any)}
          data-placement={popperAttributes?.['data-popper-placement']}
          tabIndex={-1}
        >
          <Calendar
            visibleDate={visibleDate}
            onVisibleDateChange={handleVisibleDateChange}
            onDayClick={handleDayClick}
            {...calendarProps}
            // Merged, so that other modifiers of calendarProps do not remove these ones
            modifiers={{
              ...calendarProps?.modifiers,
              selected: (day) => value && isSameDay(day, value),
              // calendarProps may disable more days, but never enable those out of minDate and maxDate
              disabled: (day, monthViewProps) =>
                isOutOfRange(day) || !!calendarProps?.modifiers?.disabled?.(day, monthViewProps),
            }}
          />
        </div>
      )}
    </FocusManagerContainer>
  )
}

DateField.defaultProps = {
  icon: 'calendarOutline',
  onChange: () => null,
  onFocus: () => null,
  onClick: () => null,
  transformTwoYearDigit: false,
} as Partial<DateFieldProps>

export const disableByRange = (minDate?: Date, maxDate?: Date) => {
  const realMinDate = new Date(minDate)
  realMinDate.setHours(0, 0, 0, 0)

  const realMaxDate = new Date(maxDate)
  realMaxDate.setHours(23, 59, 59, 999)

  return (day: Date) => {
    return (minDate && day < realMinDate) || (maxDate && day > realMaxDate)
  }
}

const createStyles = (theme: Theme) => ({
  root: {
    zIndex: theme.zIndex.popper,
    background: theme.pallete.surface.main,
    boxShadow: theme.shadows.outer[40],
    borderRadius: theme.radius.popper,
    padding: '0.5rem .25rem .25rem .25rem',
    outline: 'none',
  },
})
