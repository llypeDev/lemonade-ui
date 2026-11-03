import { Interpolation } from 'emotion'
import React, { CSSProperties, useCallback, useMemo } from 'react'

import { focusBoxShadow, Theme, useStyles } from '../../styles'
import { getUserLocale } from '../../util/locale'
import { Week } from '../DateRangePicker/DateRangePicker'

import { createMonthMatrix, isSameDay } from './util'

export interface MonthViewProps {
  /**
   * The current visible date.
   * Only the month and year of this date is used to know which month to render, so the day doesn't matter.
   */
  visibleDate: Date

  createDateStyles?(element: any, props: MonthViewProps): Interpolation

  onDayClick?(day: Date): void
  onDayHover?(day: Date): void
  renderDay?(day: Date): React.ReactNode
  renderWeekName?(firstWeekDay: Date): React.ReactNode
  isDaySelected?(day: Date): boolean

  /**
   * Days that cannot be picked, announced as disabled
   */
  isDayDisabled?(day: Date): boolean

  onWeekClick?(week: Week): void
  onWeekHover?(week: Week): void

  onlyWeeks?: boolean

  /**
   * The only day in the tab order, as in a roving tabindex. Without it, the days do not take the focus.
   */
  tabbableDay?: Date

  /**
   * Called on a key down in a day, to move the focus or pick it
   */
  onDayKeyDown?(day: Date, e: React.KeyboardEvent<HTMLElement>): void

  /**
   * Called when a day gets the focus
   */
  onDayFocus?(day: Date): void
}

export function MonthView(props: MonthViewProps) {
  const {
    onlyWeeks,
    visibleDate,
    renderDay,
    renderWeekName,
    onDayClick,
    onDayHover,
    onWeekClick,
    onWeekHover,
    createDateStyles,
    tabbableDay,
    onDayKeyDown,
    onDayFocus,
  } = props
  const { classes, css } = useStyles(createStyles)

  const month = useMemo(() => createMonthMatrix(visibleDate), [visibleDate])
  const handleDayClick = useCallback((day: Date) => () => onDayClick(day), [onDayClick])
  const handleDayHover = useCallback((day: Date) => () => onDayHover(day), [onDayHover])

  const handleWeekClick = useCallback((week: Week) => () => onWeekClick(week), [onWeekClick])
  const handleWeekHover = useCallback((week: Week) => () => onWeekHover(week), [onWeekHover])

  const handleDayKeyDown = (day: Date) => (e: React.KeyboardEvent<HTMLElement>) => onDayKeyDown(day, e)
  const handleDayFocus = (day: Date) => () => onDayFocus(day)

  return (
    <table className={classes.table}>
      <thead>
        <tr>
          {month[0].map((day, d) => (
            <th key={d}>{renderWeekName(day)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {month.map((week, w) => (
          <tr
            key={w}
            className={
              onlyWeeks ? css(classes.week, createDateStyles({ start: week[0], end: week[6] }, props)) : undefined
            }
            onClick={onlyWeeks ? handleWeekClick({ start: week[0], end: week[6] }) : undefined}
            onMouseOver={onlyWeeks ? handleWeekHover({ start: week[0], end: week[6] }) : undefined}
            data-week={
              onlyWeeks ? `${week[0].toLocaleDateString('pt-BR')}-${week[6].toLocaleDateString('pt-BR')}` : undefined
            }
          >
            {week.map((day, d) => (
              <td key={d} data-date={onlyWeeks ? undefined : formatLocalDate(day)}>
                <span
                  className={onlyWeeks ? classes.weekDay : css(classes.day, createDateStyles(day, props))}
                  onClick={onlyWeeks ? undefined : handleDayClick(day)}
                  onMouseOver={onlyWeeks ? undefined : handleDayHover(day)}
                  onKeyDown={onDayKeyDown && handleDayKeyDown(day)}
                  onFocus={onDayFocus && handleDayFocus(day)}
                  tabIndex={tabbableDay ? (isSameDay(day, tabbableDay) ? 0 : -1) : undefined}
                  role='button'
                  aria-selected={onlyWeeks ? undefined : props.isDaySelected && props.isDaySelected(day)}
                  aria-disabled={(!onlyWeeks && props.isDayDisabled && props.isDayDisabled(day)) || undefined}
                >
                  {renderDay(day)}
                </span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const pad = (n: number, length: number) => {
  const s = String(n)
  return s.length < length ? ('000' + s).slice(-length) : s
}

/**
 * Formats the local day as yyyy-mm-dd. toISOString gives the UTC day, which is the day before east of UTC.
 */
const formatLocalDate = (day: Date) =>
  `${pad(day.getFullYear(), 4)}-${pad(day.getMonth() + 1, 2)}-${pad(day.getDate(), 2)}`

MonthView.defaultProps = {
  onDayClick: () => null,
  onDayHover: () => null,

  onWeekClick: () => null,
  onWeekHover: () => null,

  onlyWeeks: false,

  createDateStyles: () => null,

  renderDay: (day) => {
    const dayFormatter = new Intl.DateTimeFormat(getUserLocale(), { day: '2-digit' })
    return dayFormatter.format(day)
  },
  renderWeekName: (firstWeekDay) => {
    const weekFormatter = new Intl.DateTimeFormat(getUserLocale(), { weekday: 'narrow' })
    return weekFormatter.format(firstWeekDay)
  },
} as Partial<MonthViewProps>

export const createStyles = (theme: Theme) => ({
  table: {
    borderCollapse: 'separate',
    textAlign: 'center',
    lineHeight: '1.5rem',
    width: '100%',
    borderSpacing: '0 0.25rem',

    th: {
      width: '2rem',
      padding: '0.25rem 0',
    },

    'tr td:first-child': {
      borderTopLeftRadius: '10%',
      borderBottomLeftRadius: '10%',
    },

    'tr td:last-child': {
      borderTopRightRadius: '10%',
      borderBottomRightRadius: '10%',
    },
  } as CSSProperties,
  day: {
    width: '2rem',
    padding: '0.25rem 0',
    display: 'inline-block',
    borderRadius: '50%',

    outline: 'none',

    ':hover': {
      cursor: 'pointer',
      background: theme.pallete.surface.background,
    },

    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  weekDay: {
    borderRadius: '50%',
    outline: 'none',

    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  week: {
    padding: '0.25rem 0',

    ':hover': {
      cursor: 'pointer',
      background: theme.pallete.surface.background,
    },
  } as CSSProperties,
  active: {
    background: theme.pallete.primary.main,
    color: theme.pallete.surface.main,
  } as CSSProperties,
})
