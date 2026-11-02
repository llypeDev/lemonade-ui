import React, { useCallback } from 'react'
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe'
import { useLocale } from '../../i18n'
import { composeHandlers } from '../../util/react'
import { Omit } from '../../util/types'
import { isValidDate } from '../Calendar/util'
import { MaskedTextField, MaskedTextFieldProps } from '../MaskedTextField'

export interface DateInputProps extends Omit<MaskedTextFieldProps, 'onChange' | 'value'> {
  value?: Date
  onInputChange?: MaskedTextFieldProps['onChange']
  onChange?(date: Date | null): void
  transformTwoYearDigit?: boolean
}

const formatter = new Intl.DateTimeFormat('pt-br', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/**
 * Creates the typed date, or undefined when the month does not have the day: Date would roll 29/02/2023 over to
 * 01/03/2023.
 */
const createTypedDate = (year: number, month: number, day: number): Date | undefined => {
  const date = new Date(year, month, day)
  // new Date() takes the years 0 to 99 as 1900 to 1999, setFullYear does not
  date.setFullYear(year, month, day)
  return date.getDate() === day && date.getMonth() === month ? date : undefined
}

export function DateInput(props: DateInputProps) {
  const { value, onInputChange, onChange, onKeyDown, transformTwoYearDigit, ...rest } = props
  const locale = useLocale()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e || !e.target || !e.target.value) {
        onChange(null)
        return
      }

      const targetValue = e.target.value
      const match: RegExpMatchArray = targetValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      const date = match && createTypedDate(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10))
      if (date) {
        onChange(date)
      }

      if (onInputChange) {
        return onInputChange(e)
      }
    },
    [onChange, onInputChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (transformTwoYearDigit && e.key === 'Tab') {
        const targetAsInputElement = e.target as HTMLInputElement

        const match: RegExpMatchArray = targetAsInputElement.value.match(/^(\d{2})\/(\d{2})\/(\d{2}__)$/)

        if (match) {
          const yearPart: string = match[3]
          const yearPartClean: string = yearPart.substr(0, 2)

          const yearInTwoDigits: number = parseInt(yearPartClean, 10)
          const currentYearInTwoDigits: number = new Date().getFullYear() - 2000 // only works until 2100 :$

          const resultYear: string =
            yearInTwoDigits <= currentYearInTwoDigits ? `20${yearPartClean}` : `19${yearPartClean}`

          const resultDate = createTypedDate(
            parseInt(resultYear, 10),
            parseInt(match[2], 10) - 1,
            parseInt(match[1], 10)
          )
          if (resultDate) {
            onChange(resultDate)
          }
        }
      }
    },
    [transformTwoYearDigit, onChange]
  )

  return (
    <MaskedTextField
      value={isValidDate(value) ? formatter.format(value) : null}
      mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
      placeholder={locale.dateInput.placeholder}
      pipe={createAutoCorrectedDatePipe('dd/mm/yyyy')}
      autoComplete='off'
      onChange={handleChange}
      onKeyDown={composeHandlers(handleKeyDown, onKeyDown)}
      {...rest}
    />
  )
}

DateInput.defaultProps = {} as Partial<DateInputProps>
