import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, useStyles } from '../../styles'
import { randomStr } from '../../util/string'
import { DateField, DateFieldProps } from '../DateField'
import { FormError, FormLabel } from '../FormControl'
import { TimeField } from '../TimeField'

export interface DateTimeFieldProps {
  /**
   * The moment, for a controlled field. It is `null` while the date or the time is empty or incomplete.
   */
  value?: Date | null

  /**
   * Called with the moment when both parts are complete, and with `null` when one of them is cleared
   */
  onChange?(value: Date | null): void

  label?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
  disabled?: boolean

  /**
   * Earliest day that can be picked in the calendar
   */
  minDate?: Date

  /**
   * Latest day that can be picked in the calendar
   */
  maxDate?: Date

  /**
   * Base for the ids of the two fields, which get the `-date` and `-time` suffixes
   */
  id?: string

  /**
   * Name of the fields in a form, with the `-date` and `-time` suffixes
   */
  name?: string

  /**
   * Props for the date field, such as `calendarProps`
   */
  dateFieldProps?: Partial<DateFieldProps>

  style?: ExternalStyles
}

const pad = (value: number) => String(value).padStart(2, '0')

const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

const parseTime = (time: string): [number, number] | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(time || '')
  if (!match) {
    return null
  }
  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  return hours < 24 && minutes < 60 ? [hours, minutes] : null
}

const combine = (date: Date | null, time: string): Date | null => {
  const parsed = parseTime(time)
  if (!date || !parsed) {
    return null
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), parsed[0], parsed[1])
}

/**
 * A date and a time in one field, such as the start of an appointment. The calendar picks the day, and the time
 * is typed as hh:mm. The value is a single `Date`.
 */
export function DateTimeField(props: DateTimeFieldProps) {
  const { value, onChange, label, error, required, disabled, minDate, maxDate, id, name, dateFieldProps, style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const ids = useMemo(() => {
    const base = id ?? `date-time-field-${randomStr()}`
    return { label: `${base}-label`, error: `${base}-error`, date: `${base}-date`, time: `${base}-time` }
  }, [id])

  // Each part is kept apart, so a half filled field does not lose what the user typed
  const [date, setDate] = useState<Date | null>(value ?? null)
  const [time, setTime] = useState(value ? formatTime(value) : '')
  const lastValue = useRef<Date | null>(value ?? null)

  // A new value from the parent replaces both parts
  useEffect(() => {
    const current = lastValue.current
    const same = (value ?? null) === current || (value && current && value.getTime() === current.getTime())
    if (value !== undefined && !same) {
      lastValue.current = value
      setDate(value)
      setTime(value ? formatTime(value) : '')
    }
  }, [value])

  const emit = (nextDate: Date | null, nextTime: string) => {
    const next = combine(nextDate, nextTime)
    const current = lastValue.current
    const changed = next ? !current || next.getTime() !== current.getTime() : current !== null
    lastValue.current = next
    if (changed) {
      onChange && onChange(next)
    }
  }

  const handleDateChange = (nextDate: Date | null) => {
    setDate(nextDate)
    emit(nextDate, time)
  }

  const handleTimeChange = (nextTime: string | null) => {
    setTime(nextTime ?? '')
    emit(date, nextTime ?? '')
  }

  const describedBy = error ? ids.error : undefined

  return (
    <div role='group' aria-labelledby={label ? ids.label : undefined} className={css(classes.root, style)}>
      {label && <FormLabel id={ids.label} label={label} required={required} style={classes.label} htmlFor={ids.date} />}
      <div className={classes.row}>
        <div className={classes.date}>
          <DateField
            id={ids.date}
            name={name && `${name}-date`}
            aria-label={locale.dateTimeField.date}
            value={date}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            required={required}
            disabled={disabled}
            invalid={!!error}
            aria-invalid={error ? true : undefined}
            aria-errormessage={describedBy}
            {...dateFieldProps}
          />
        </div>
        <div className={classes.time}>
          <TimeField
            id={ids.time}
            name={name && `${name}-time`}
            aria-label={locale.dateTimeField.time}
            value={time}
            onChange={handleTimeChange}
            required={required}
            disabled={disabled}
            invalid={!!error}
            aria-invalid={error ? true : undefined}
            aria-errormessage={describedBy}
          />
        </div>
      </div>
      {error && (
        <FormError id={ids.error} role='alert' style={classes.error}>
          {error}
        </FormError>
      )}
    </div>
  )
}

const createStyles = () => ({
  root: {
    border: 0,
    margin: 0,
    padding: 0,
    minWidth: 0,
  } as CSSProperties,
  label: {
    display: 'block',
    marginBottom: '0.25rem',
  } as CSSProperties,
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  } as CSSProperties,
  date: {
    flex: '1 1 9rem',
    minWidth: 0,
  } as CSSProperties,
  time: {
    flex: '0 0 6rem',
  } as CSSProperties,
  error: {
    marginTop: '0.25rem',
  } as CSSProperties,
})
