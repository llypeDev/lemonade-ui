import { Interpolation } from 'emotion'
import React, {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Theme, useStyles } from '../../styles'
import { Week } from '../DateRangePicker/DateRangePicker'
import { HFlow } from '../HFlow'

import { MonthControl } from './MonthControl'
import { MonthView, MonthViewProps } from './MonthView'
import { createWeekArray, getLastDayOfMonth, isSameDay, isBelongingAWeek, isValidDate } from './util'
import { YearControl } from './YearControl'

export interface CalendarProps extends Omit<MonthViewProps, 'tabbableDay' | 'onDayKeyDown' | 'onDayFocus'> {
  /**
   * Map of modifier predicates to apply custom or pre-defined styles to dates.
   */
  modifiers?: Partial<ModifierPredicateMap>

  /**
   * Map of modifier styles to be applied to a date if the respective modifier predicate applies.
   */
  modifierStyles?: Partial<ModifierStyleMap>

  /**
   * Called when the current visible date changes.
   * You might want to change the current `visibleDate` prop when this occurs.
   * @param visibleDate The new visible date.
   */
  onVisibleDateChange(visibleDate: Date): void

  /**
   *
   */
  onMouseLeave?(e: MouseEvent<HTMLDivElement>): void

  /**
   *
   */
  isDaySelected?(day: Date): boolean
}

export function Calendar(props: CalendarProps) {
  const {
    onlyWeeks,
    visibleDate,
    modifiers,
    modifierStyles,
    onVisibleDateChange,
    onMouseLeave,
    isDaySelected,
    ...rest
  } = props

  const { classes, theme } = useStyles(createStyles)

  const allModifiers = useMemo(() => ({ ...(onlyWeeks ? defaultWeekModifiers : defaultDayModifiers), ...modifiers }), [
    modifiers,
    onlyWeeks,
  ])
  const allModifierStyles = useMemo(() => ({ ...defaultModifierStyles, ...modifierStyles }), [modifierStyles])

  const createDateStyles = useMemo(() => createStylesFn(allModifiers, allModifierStyles, theme), [
    allModifiers,
    allModifierStyles,
    theme,
  ])

  const handleDayClick = useCallback(
    (day: Date) => {
      if (!allModifiers.disabled(day, props)) {
        onVisibleDateChange(day)
        return props.onDayClick && props.onDayClick(day)
      }
    },
    [allModifiers, onVisibleDateChange, props]
  )

  const isDayDisabled = useCallback((day: Date) => !!allModifiers.disabled(day, props), [allModifiers, props])

  const handleWeekClick = useCallback(
    (week: Week) => {
      if (!allModifiers.disabled(week, props)) {
        onVisibleDateChange(week.start)
        return props.onWeekClick && props.onWeekClick(week)
      }
    },
    [allModifiers, onVisibleDateChange, props]
  )

  // A single day is in the tab order, and the keyboard moves it as in the date picker dialog of WAI-ARIA APG:
  // https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
  const rootRef = useRef<HTMLDivElement>()
  const [activeDay, setActiveDay] = useState<Date>()
  const focusPending = useRef(false)

  const monthDays = useMemo(() => getMonthDays(visibleDate), [visibleDate])

  // With only weeks, the modifiers receive the week of the day
  const isPickable = (day: Date) => !allModifiers.disabled(onlyWeeks ? weekOf(day) : day, props)
  const isSelected = (day: Date) =>
    (isDaySelected && isDaySelected(day)) || !!allModifiers.selected(onlyWeeks ? weekOf(day) : day, props)

  const findInMonth = (day?: Date) => day && monthDays.find((d) => isSameDay(d, day))
  const selectedDays = monthDays.filter(isSelected)
  const tabbableDay =
    findInMonth(activeDay) ||
    // A range calendar shows the end that is being picked
    selectedDays.find((d) => isSameDay(d, visibleDate)) ||
    selectedDays[0] ||
    findInMonth(new Date()) ||
    monthDays.find(isPickable) ||
    monthDays[0]

  useEffect(() => {
    if (focusPending.current) {
      focusPending.current = false
      focusTabbableDay(rootRef.current)
    }
  })

  const handleDayFocus = (day: Date) => {
    if (!activeDay || !isSameDay(day, activeDay)) {
      setActiveDay(day)
    }
  }

  const handleDayKeyDown = (day: Date, e: KeyboardEvent<HTMLElement>) => {
    // Keeps shortcuts such as Alt+ArrowLeft, which goes back in the browser history
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return
    }

    if (e.key === 'Enter' || e.key === ' ') {
      // Also keeps Enter from reaching the input that gets the focus, which would submit its form
      e.preventDefault()
      return onlyWeeks ? handleWeekClick(weekOf(day)) : handleDayClick(day)
    }

    const target = getKeyboardTarget(day, e.key, e.shiftKey)
    if (!target) {
      return
    }

    e.preventDefault()
    focusPending.current = true
    setActiveDay(target)
    if (target.getMonth() !== visibleDate.getMonth() || target.getFullYear() !== visibleDate.getFullYear()) {
      onVisibleDateChange(target)
    }
  }

  return (
    <div ref={rootRef} className={classes.root} onMouseLeave={onMouseLeave}>
      <HFlow hSpacing={0.5} justifyContent='space-around' style={classes.controls}>
        <MonthControl visibleDate={visibleDate} onChange={onVisibleDateChange} />
        <YearControl visibleDate={visibleDate} onChange={onVisibleDateChange} />
      </HFlow>
      <MonthView
        visibleDate={visibleDate}
        createDateStyles={createDateStyles}
        {...rest}
        onDayClick={handleDayClick}
        isDaySelected={isDaySelected}
        isDayDisabled={isDayDisabled}
        onWeekClick={handleWeekClick}
        onlyWeeks={onlyWeeks}
        tabbableDay={tabbableDay}
        onDayKeyDown={handleDayKeyDown}
        onDayFocus={handleDayFocus}
      />
    </div>
  )
}

/**
 * Moves the focus to the day of the calendar that is in the tab order, such as when a date field opens with the
 * keyboard.
 */
export const focusTabbableDay = (root: HTMLElement | null | undefined, options?: FocusOptions) => {
  const day = root && root.querySelector<HTMLElement>('td [tabindex="0"]')
  day && day.focus(options)
}

const getMonthDays = (visibleDate: Date): Date[] => {
  if (!isValidDate(visibleDate)) {
    return []
  }

  const year = visibleDate.getFullYear()
  const month = visibleDate.getMonth()
  const length = getLastDayOfMonth(visibleDate).getDate()
  return Array.from({ length }, (_, i) => new Date(year, month, i + 1))
}

const weekOf = (day: Date): Week => {
  const week = createWeekArray(day)
  return { start: week[0], end: week[6] }
}

const addDays = (day: Date, days: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate() + days)

// Keeps the day in the target month: January 31 plus a month is February 28 or 29
const addMonths = (day: Date, months: number) => {
  const firstDay = new Date(day.getFullYear(), day.getMonth() + months, 1)
  const lastDay = getLastDayOfMonth(firstDay).getDate()
  return new Date(firstDay.getFullYear(), firstDay.getMonth(), Math.min(day.getDate(), lastDay))
}

const getKeyboardTarget = (day: Date, key: string, shiftKey: boolean): Date | null => {
  switch (key) {
    case 'ArrowLeft':
      return addDays(day, -1)
    case 'ArrowRight':
      return addDays(day, 1)
    case 'ArrowUp':
      return addDays(day, -7)
    case 'ArrowDown':
      return addDays(day, 7)
    case 'Home':
      return addDays(day, -day.getDay())
    case 'End':
      return addDays(day, 6 - day.getDay())
    case 'PageUp':
      return addMonths(day, shiftKey ? -12 : -1)
    case 'PageDown':
      return addMonths(day, shiftKey ? 12 : 1)
    default:
      return null
  }
}

export const createStyles = () => ({
  root: {
    width: 288,
  } as CSSProperties,
  controls: {
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  } as CSSProperties,
})

export type ModifierFn = (element: any, props?: MonthViewProps) => boolean

export interface ModifierPredicateMap {
  disabled: ModifierFn
  selected: ModifierFn
  today: ModifierFn
  adjacentMonth: ModifierFn
  [key: string]: ModifierFn
}

export type ModifierStyleMap = { [key in keyof ModifierPredicateMap]: (theme: Theme) => Interpolation }

export const defaultDayModifiers: ModifierPredicateMap = {
  today: (day: Date) => isSameDay(new Date(), day),
  disabled: () => false,
  selected: () => false,
  adjacentMonth: (day: Date, { visibleDate }) => visibleDate.getMonth() !== day.getMonth(),
}

export const defaultWeekModifiers: ModifierPredicateMap = {
  today: (week: Week) => isBelongingAWeek(new Date(), week),
  disabled: () => false,
  selected: () => false,
  adjacentMonth: () => false,
}

export const defaultModifierStyles: ModifierStyleMap = {
  today: () => ({
    fontWeight: 'bold',
  }),
  disabled: (theme: Theme) => ({
    color: theme.pallete.text.disabled,
    ':hover': {
      background: 'initial',
      cursor: 'not-allowed',
    },
  }),
  selected: (theme: Theme) => ({
    background: theme.pallete.primary.main,
    color: theme.pallete.surface.main,
    fontWeight: 'bold',
    ':hover': {
      background: theme.pallete.primary.main,
      color: theme.pallete.surface.main,
    },
  }),
  adjacentMonth: (theme: Theme) => ({
    // These days can still be picked, so they keep a readable contrast; disabled days use text.disabled
    color: theme.pallete.text.secondary,
  }),
}

export const createStylesFn = (modifiers: ModifierPredicateMap, styles: ModifierStyleMap, theme: Theme) => (
  element: any,
  props: MonthViewProps
): Interpolation => {
  return Object.keys(modifiers).reduce((s, modifier) => {
    if (!styles[modifier]) {
      throw new Error(`You must provied a modifierStyle for predicate "${modifier}"`)
    }
    return {
      ...s,
      ...(modifiers[modifier](element, props) ? (styles[modifier](theme) as any) : {}),
    }
  }, {})
}
