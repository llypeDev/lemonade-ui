import { Options as PopperOptions } from '@popperjs/core'
import React, { useEffect, useRef, useState } from 'react'
import { usePopper } from 'react-popper'
import { Theme, useStyles } from '../..'
import { composeHandlers, composeRefs } from '../../util/react'
import { usePickerPopup } from '../Calendar/usePickerPopup'
import { DateRange } from '../DateRangePicker'
import { FocusManagerContainer } from '../FocusManagerContainer'
import { MonthPickerProps, ReferenceMonth } from '../MonthPicker'
import { focusTabbableMonth } from '../MonthPicker/MonthPicker'
import { ControlledMonthRangeCalendar } from './RangeMonthCalendar/ControlledMonthRangeCalendar'
import { MonthRangePickerInput, MonthRangePickerInputProps } from './MonthRangePickerInput'
import { disabledByMonth, isGreaterThan, transformRangeReferenceMonth } from './util'

export interface MonthRangePickerProps extends Omit<MonthRangePickerInputProps, 'onChange'> {
  popperProps?: PopperOptions
  monthPickerProps?: Partial<MonthPickerProps>
  onFocus?(e: React.FocusEvent<HTMLDivElement>): void
  onBlur?(e: React.FocusEvent<HTMLDivElement>): void
  onChange?(dateRange: DateRange): void
}

export interface ReferenceMonthRange {
  start?: ReferenceMonth
  end?: ReferenceMonth
}

export function MonthRangePicker(props: MonthRangePickerProps) {
  const {
    minMonth,
    maxMonth,
    popperProps,
    onFocus,
    onBlur,
    onChange,
    value,
    icon,
    monthPickerProps,
    onIconClick,
    onInputClick,
    onInputKeyDown,
    initialInputRef: externalInitialInputRef,
    finalInputRef: externalFinalInputRef,
    ...rest
  } = props

  const [rangeInputFocus, setRangeInputFocus] = useState(1)
  const [visibleMonth, setVisibleMonth] = useState<ReferenceMonth>({ month: undefined, year: undefined })

  const initialInputRef = useRef<HTMLInputElement>()
  const finalInputRef = useRef<HTMLInputElement>()
  const [anchorRef, setAnchorRef] = useState<HTMLDivElement>()
  const [popupRef, setPopupRef] = useState<HTMLDivElement>()

  const { open, setOpen, handleInputKeyDown } = usePickerPopup({
    popup: popupRef,
    focusTabStop: focusTabbableMonth,
    // The input of the month that the picker picks
    getInput: () => (rangeInputFocus === 2 ? finalInputRef.current : initialInputRef.current),
    isOwnElement: (element) => !!anchorRef?.contains(element),
  })

  const { classes, css } = useStyles(createStyles)

  useEffect(() => {
    const month = (): ReferenceMonth => {
      if (rangeInputFocus === 1 && value?.start) {
        return value.start
      } else if (rangeInputFocus === 2 && value?.end) {
        return value.end
      } else if (value?.start && !value?.end) {
        return value.start
      } else if (!value?.start && value?.end) {
        return value.end
      } else {
        const today = new Date()
        return { month: today.getMonth(), year: today.getFullYear() }
      }
    }

    setVisibleMonth(month)
    // Each time the picker opens or closes, it goes back to the year of the value
  }, [rangeInputFocus, value, open])

  // The placement of popperProps wins over the default one
  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(anchorRef, popupRef, { placement: 'bottom', ...popperProps })

  const handleInputFocus = (inputOnFocus: number) => setRangeInputFocus(inputOnFocus)

  // The focus alone does not open the picker, which would cover the next fields while Tab goes through a form
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

  const handleMonthRangeChanged = (range: ReferenceMonthRange) => {
    const { start, end } = range

    start && end
      ? // Switches an inverted range, as DateRangePicker does
        onChange(transformRangeReferenceMonth(isGreaterThan(start, end) ? { start: end, end: start } : range))
      : !end
      ? onChange(transformRangeReferenceMonth({ start: start, end: start }))
      : onChange(transformRangeReferenceMonth({ start: end, end: end }))
  }

  const handleInputMonthRangeChanged = (range: ReferenceMonthRange) => onChange(transformRangeReferenceMonth(range))

  const handleOnVisibleMonthChange = (month: ReferenceMonth) => setVisibleMonth(month)

  const handleOnMonhtClick = () => finalInputRef.current.focus()

  return (
    <FocusManagerContainer onFocusIn={handleFocusIn} onFocusOut={handleFocusOut}>
      <MonthRangePickerInput
        value={value}
        onChange={handleInputMonthRangeChanged}
        divRef={setAnchorRef}
        minMonth={minMonth}
        maxMonth={maxMonth}
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
          className={css(classes.popup, popperStyle as any)}
          tabIndex={-1}
          data-placement={popperAttributes?.['data-popper-placement']}
        >
          <ControlledMonthRangeCalendar
            value={value}
            onChange={handleMonthRangeChanged}
            onMonthClick={handleOnMonhtClick}
            inputOnFocus={rangeInputFocus}
            visibleMonth={visibleMonth}
            onVisibleMonthChange={handleOnVisibleMonthChange}
            minMonth={minMonth}
            maxMonth={maxMonth}
            isDisabled={disabledByMonth(minMonth, maxMonth)}
            {...monthPickerProps}
          />
        </div>
      )}
    </FocusManagerContainer>
  )
}

const createStyles = (theme: Theme) => ({
  popup: {
    zIndex: theme.zIndex.popper,
  },
})
