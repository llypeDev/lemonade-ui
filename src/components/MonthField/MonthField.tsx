import { Options as PopperOptions } from '@popperjs/core'
import React, { useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import { useLocale } from '../../i18n'
import { useStyles } from '../../styles/hooks/useStyles'
import { Theme } from '../../styles/theme/createTheme'
import { composeHandlers, composeRefs } from '../../util/react'
import { FocusManagerContainer } from '../FocusManagerContainer'
import { MonthPicker, MonthPickerProps, ReferenceMonth } from '../MonthPicker'
import { focusTabbableMonth } from '../MonthPicker/MonthPicker'
import { disabledByMonth, isSameReferenceMonth } from '../MonthRangePicker/util'
import { usePickerPopup } from '../Calendar/usePickerPopup'
import { isValidReferenceMonth } from '../Calendar/util'
import { MonthInput, MonthInputProps } from './MonthInput'

export interface MonthFieldProps extends MonthInputProps {
  minMonth?: ReferenceMonth
  maxMonth?: ReferenceMonth
  popperProps?: PopperOptions
  monthPickerProps?: Partial<MonthPickerProps>
}

export function MonthField(props: MonthFieldProps) {
  const {
    value,
    popperProps,
    inputRef,
    onChange,
    onClick,
    onKeyDown,
    onIconClick,
    iconRef,
    maxMonth,
    minMonth,
    monthPickerProps,
    ...rest
  } = props
  const locale = useLocale()

  const { classes, css } = useStyles(createStyles)

  const [anchorRef, setAnchorRef] = useState<HTMLInputElement>()
  const [popperRef, setPopperRef] = useState<HTMLDivElement>()
  const [iconButton, setIconButton] = useState<HTMLButtonElement>()

  const { open, setOpen, handleInputKeyDown } = usePickerPopup({
    popup: popperRef,
    focusTabStop: focusTabbableMonth,
    getInput: () => anchorRef,
    isOwnElement: (element) => !!iconButton?.contains(element),
  })

  const [visibleMonth, setVisibleMonth] = useState<ReferenceMonth>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  })

  // Each time the picker opens or closes, it goes back to the year of the value
  useEffect(() => {
    setVisibleMonth(
      isValidReferenceMonth(value)
        ? value
        : {
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
          }
    )
  }, [value, open])

  // The placement of popperProps wins over the default one
  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(anchorRef, popperRef, { placement: 'bottom-start', ...popperProps })

  const handleVisibleMonthChange = (month: ReferenceMonth) => setVisibleMonth(month)

  const handleInputChange = (month: ReferenceMonth) => {
    onChange && onChange(month)
  }

  // The month button goes away with the picker, so the input keeps the focus, as in DateField
  const handleMonthClick = (month: ReferenceMonth) => {
    anchorRef && anchorRef.focus()
    setOpen(false)
    onChange && onChange(month)
  }

  // The focus alone does not open the picker, which would cover the next fields while Tab goes through a form
  const handleInputClick = () => setOpen(true)
  const handleInputIconClick = () => setOpen(true)
  const handleFocusOut = () => setOpen(false)

  return (
    <FocusManagerContainer onFocusOut={handleFocusOut}>
      <MonthInput
        inputRef={composeRefs(setAnchorRef, inputRef)}
        value={value}
        icon='calendarOutline'
        iconRef={composeRefs(setIconButton, iconRef)}
        iconAriaLabel={locale.calendar.open}
        onIconClick={composeHandlers(handleInputIconClick, onIconClick)}
        onClick={composeHandlers(handleInputClick, onClick)}
        onKeyDown={composeHandlers(handleInputKeyDown, onKeyDown)}
        onChange={handleInputChange}
        {...rest}
      />

      {open && (
        <div
          ref={setPopperRef}
          className={css(classes.popup, popperStyle as any)}
          data-placement={popperAttributes?.['data-popper-placement']}
          data-testid='MonthField.popup'
          // A click on its empty space moves the focus here, instead of out of the field, which would close it
          tabIndex={-1}
        >
          <MonthPicker
            visibleMonth={visibleMonth}
            onVisibleMonthChange={handleVisibleMonthChange}
            onMonthClick={handleMonthClick}
            isDisabled={disabledByMonth(minMonth, maxMonth)}
            {...monthPickerProps}
            // Merged, so that other modifiers of monthPickerProps do not remove this one
            modifiers={{
              ...monthPickerProps?.modifiers,
              selected: (month: ReferenceMonth) => value && isSameReferenceMonth(value, month),
            }}
          />
        </div>
      )}
    </FocusManagerContainer>
  )
}

const createStyles = (theme: Theme) => ({
  popup: {
    zIndex: theme.zIndex.popper,
    outline: 'none',
  },
})
