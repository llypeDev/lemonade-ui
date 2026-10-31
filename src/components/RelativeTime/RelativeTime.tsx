import React, { CSSProperties, useEffect, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Tooltip } from '../Tooltip'

export interface RelativeTimeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'children'> {
  /**
   * The moment to describe, as a `Date`, a timestamp in milliseconds or an ISO string
   */
  date: Date | number | string

  /**
   * Moment to compare with. When given, the text no longer updates by itself, which helps on the server and in
   * tests.
   * @default the current time, updated while the component is on the screen
   */
  now?: Date | number

  /**
   * Length of the words, such as "2 hours ago", "2 hr. ago" or "2h ago"
   * @default 'long'
   */
  format?: 'long' | 'short' | 'narrow'

  /**
   * Language of the text, as a BCP 47 tag such as `pt-BR`
   * @default the language of the locale strings
   */
  language?: string

  /**
   * How the full date shows in the tooltip
   * @default { dateStyle: 'full', timeStyle: 'short' }
   */
  dateFormat?: Intl.DateTimeFormatOptions

  /**
   * Shows the full date in a tooltip when the pointer is over the text
   * @default true
   */
  tooltip?: boolean

  style?: ExternalStyles
}

type Unit = Intl.RelativeTimeFormatUnit

// Each unit is used while its rounded value stays below the limit, so the text never says "60 minutes"
const units: Array<[Unit, number, number]> = [
  ['minute', 60, 60],
  ['hour', 60 * 60, 24],
  ['day', 24 * 60 * 60, 7],
  ['week', 7 * 24 * 60 * 60, 4],
  ['month', 30.44 * 24 * 60 * 60, 12],
]

const year = 365.25 * 24 * 60 * 60

/**
 * Picks the unit and the value that describe a difference in seconds, negative for the past
 */
export const relativeTimeParts = (seconds: number): [number, Unit] => {
  const abs = Math.abs(seconds)
  const sign = seconds < 0 ? -1 : 1

  // Less than a minute reads as "now"
  if (abs < 45) {
    return [0, 'second']
  }

  for (const [unit, size, limit] of units) {
    const value = Math.round(abs / size)
    if (value < limit) {
      return [sign * value, unit]
    }
  }

  return [sign * Math.round(abs / year), 'year']
}

// Recent times change their text sooner, so they update more often
const updateDelay = (seconds: number) => {
  const abs = Math.abs(seconds)
  return abs < 60 * 60 ? 10 * 1000 : abs < 24 * 60 * 60 ? 60 * 1000 : 60 * 60 * 1000
}

const toTime = (value: Date | number | string) => (value instanceof Date ? value.getTime() : new Date(value).getTime())

/**
 * A moment described from now, such as "2 hours ago" or "in 3 days", in the language of the locale strings.
 * The text updates by itself, and the full date shows in a tooltip.
 */
export function RelativeTime(props: RelativeTimeProps) {
  const {
    date,
    now,
    format = 'long',
    language,
    dateFormat = { dateStyle: 'full', timeStyle: 'short' },
    tooltip = true,
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  const time = toTime(date)
  const reference = now !== undefined ? toTime(now) : currentTime
  const seconds = (time - reference) / 1000
  const lang = language ?? locale.relativeTime.language
  const valid = !isNaN(time)

  useEffect(() => {
    if (now !== undefined || !valid) {
      return
    }

    const timeout = setTimeout(() => setCurrentTime(Date.now()), updateDelay(seconds))
    return () => clearTimeout(timeout)
  }, [now, valid, seconds])

  if (!valid) {
    return null
  }

  const [value, unit] = relativeTimeParts(seconds)
  const text = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: format }).format(value, unit)
  const fullDate = new Intl.DateTimeFormat(lang, dateFormat).format(time)

  const element = (
    <time dateTime={new Date(time).toISOString()} className={css(classes.root, style)} {...rest}>
      {text}
    </time>
  )

  return tooltip ? <Tooltip text={fullDate}>{element}</Tooltip> : element
}

const createStyles = () => ({
  root: {
    // Keeps "2 hours ago" on one line
    whiteSpace: 'nowrap',
  } as CSSProperties,
})
