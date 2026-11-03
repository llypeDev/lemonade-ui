import { css, Interpolation } from 'emotion'
import React, { CSSProperties, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { Theme, useStyles } from '../../styles'
import { getUserLocale, getMonthNames } from '../../util/locale'
import { Button } from '../Button'
import { ModifierFn } from '../Calendar/Calendar'
import { Icon } from '../Icon'
import { isSameReferenceMonth } from '../MonthRangePicker/util'
import { Text } from '../Text'

export interface MonthPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  visibleMonth: ReferenceMonth

  /**
   * Map of modifier predicates to apply custom or pre-defined styles to dates.
   */
  modifiers?: Partial<MonthModifierPredicateMap>

  /**
   * Map of modifier styles to be applied to a date if the respective modifier predicate applies.
   */
  modifierStyles?: Partial<MonthModifierStyleMap>

  onVisibleMonthChange(visibleMonth: ReferenceMonth): void
  onMouseLeave?(): void
  onMonthHover?(month: ReferenceMonth): void

  formatter?: (date: Date, month: Intl.DateTimeFormat) => string
  onMonthClick?(refMonth: ReferenceMonth): void

  isDisabled?(month: ReferenceMonth): boolean
}

/**
 * Interface representing the selected month.
 *  @
 * Months are zero indexed, so January is month 0.
 */
export interface ReferenceMonth {
  month: number
  year: number
}

export const MonthPicker = forwardRef<HTMLDivElement, MonthPickerProps>((props, ref) => {
  const {
    visibleMonth,
    modifierStyles,
    modifiers,
    formatter,
    onMouseLeave,
    onMonthHover,
    onMonthClick,
    onVisibleMonthChange,
    isDisabled,
    className,
    ...rest
  } = props
  const { classes, theme } = useStyles(createStyles)
  const locale = useLocale()

  const onLeftClick = () => {
    const year = visibleMonth.year - 1
    return onVisibleMonthChange({ month: visibleMonth.month, year: year })
  }
  const onRightClick = () => {
    const year = visibleMonth.year + 1
    return onVisibleMonthChange({ month: visibleMonth.month, year: year })
  }

  const baseYearDate = new Date(visibleMonth.year, 1, 1, 0, 0, 0, 0)
  const yearFormatter = new Intl.DateTimeFormat(getUserLocale(), { year: 'numeric' })

  const monthNames = getMonthNames(getUserLocale(), formatter)

  const allModifiers = useMemo(() => ({ ...defaultModifiers, ...modifiers }), [modifiers])

  const allModifierStyles = useMemo(() => ({ ...defaultModifierStyles, ...modifierStyles }), [modifierStyles])

  const createMonthStyles = useMemo(() => createMonthStylesFn(allModifiers, allModifierStyles, theme), [
    allModifiers,
    allModifierStyles,
    theme,
  ])

  const handleMonthHover = useCallback((month: ReferenceMonth) => () => onMonthHover(month), [onMonthHover])

  const handleMonthClick = useCallback(
    (month: ReferenceMonth) => () => {
      onVisibleMonthChange(month)
      return onMonthClick && onMonthClick(month)
    },
    [onMonthClick, onVisibleMonthChange]
  )

  // A single month is in the tab order, and the arrow keys move it, as in a grid
  const year = visibleMonth.year
  const [activeMonth, setActiveMonth] = useState<number>()
  const monthRefs = useRef<HTMLButtonElement[]>([])
  const pendingFocus = useRef<ReferenceMonth>()

  const isMonthDisabled = (month: ReferenceMonth) => !!(isDisabled && isDisabled(month))
  const isPickable = (index: number) =>
    Number.isInteger(index) && index >= 0 && index < 12 && !isMonthDisabled({ month: index, year })

  const today = new Date()
  const tabbableMonth = [
    activeMonth,
    monthIndexes.find((index) => allModifiers.selected({ month: index, year }, null)),
    visibleMonth.month,
    today.getFullYear() === year ? today.getMonth() : undefined,
    ...monthIndexes,
  ].find(isPickable)

  // After the visible year changes, the month the keyboard moved to gets the focus
  useEffect(() => {
    const pending = pendingFocus.current
    if (pending) {
      pendingFocus.current = undefined
      if (pending.year === year) {
        monthRefs.current[pending.month]?.focus()
      }
    }
  })

  // The next month that is not disabled, moving by `delta` months
  const findPickable = (from: ReferenceMonth, delta: number): ReferenceMonth | null => {
    let index = from.year * 12 + from.month
    for (let i = 0; i < maxKeyboardSteps; i++) {
      index += delta
      const month = { month: ((index % 12) + 12) % 12, year: Math.floor(index / 12) }
      if (!isMonthDisabled(month)) {
        return month
      }
    }
    return null
  }

  // The same month in another year or, when it is disabled, the nearest one of that year
  const findInYear = (month: number, targetYear: number): ReferenceMonth | null => {
    const nearest = monthIndexes
      .map((index) => ({ month: index, year: targetYear }))
      .filter((m) => !isMonthDisabled(m))
      .sort((a, b) => Math.abs(a.month - month) - Math.abs(b.month - month))
    return nearest[0] ?? null
  }

  const getKeyboardTarget = (from: ReferenceMonth, key: string): ReferenceMonth | null | undefined => {
    switch (key) {
      case 'ArrowLeft':
        return findPickable(from, -1)
      case 'ArrowRight':
        return findPickable(from, 1)
      case 'ArrowUp':
        return findPickable(from, -monthColumns)
      case 'ArrowDown':
        return findPickable(from, monthColumns)
      case 'Home':
        return findPickable({ month: -1, year: from.year }, 1)
      case 'End':
        return findPickable({ month: 12, year: from.year }, -1)
      case 'PageUp':
        return findInYear(from.month, from.year - 1)
      case 'PageDown':
        return findInYear(from.month, from.year + 1)
      default:
        return undefined
    }
  }

  const handleMonthKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Keeps shortcuts such as Alt+ArrowLeft, which goes back in the browser history
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return
    }

    const target = getKeyboardTarget({ month: index, year }, e.key)
    if (target === undefined) {
      return
    }

    e.preventDefault()
    if (!target) {
      return
    }

    setActiveMonth(target.month)
    if (target.year === year) {
      monthRefs.current[target.month]?.focus()
    } else {
      pendingFocus.current = target
      onVisibleMonthChange(target)
    }
  }

  const handleMonthFocus = (index: number) => () => setActiveMonth(index)

  return (
    <div className={css(classes.container, className)} ref={ref} {...rest}>
      <div className={classes.months}>
        <div className={classes.item}>
          <Button title={locale.calendar.previousYear} size='small' skin='ghost' onClick={onLeftClick}>
            <Icon icon='angleLeft' />
          </Button>
        </div>
        <div className={classes.item}>
          <Text fontWeight='bold' fontSize={0.875}>
            {yearFormatter.format(baseYearDate)}
          </Text>
        </div>
        <div className={classes.item}>
          <Button title={locale.calendar.nextYear} size='small' skin='ghost' onClick={onRightClick}>
            <Icon icon='angleRight' />
          </Button>
        </div>

        {monthNames.map((month, index) => (
          <div key={index} onMouseLeave={onMouseLeave} className={css(classes.item)}>
            <Button
              title={month.long}
              innerRef={(button) => (monthRefs.current[index] = button)}
              tabIndex={index === tabbableMonth ? 0 : -1}
              onKeyDown={handleMonthKeyDown(index)}
              onFocus={handleMonthFocus(index)}
              onClick={handleMonthClick({ month: index, year: visibleMonth.year })}
              skin='ghost'
              onMouseOver={handleMonthHover({ month: index, year: visibleMonth.year })}
              style={css(classes.button, createMonthStyles({ month: index, year: visibleMonth.year }))}
              disabled={isDisabled && isDisabled({ month: index, year: visibleMonth.year })}
            >
              {month.short}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
})

MonthPicker.defaultProps = {
  onMonthClick: () => null,
  onMonthHover: () => null,
} as Partial<MonthPickerProps>

const monthIndexes = Array.from({ length: 12 }, (_, index) => index)

// The months are shown in a grid of three columns
const monthColumns = 3

// How many moves the keyboard tries before it gives up looking for a month that is not disabled
const maxKeyboardSteps = 120

/**
 * Moves the focus to the month of the picker that is in the tab order, such as when a month field opens with the
 * keyboard.
 */
export const focusTabbableMonth = (root: HTMLElement | null | undefined, options?: FocusOptions) => {
  const month = root && root.querySelector<HTMLElement>('button[tabindex="0"]')
  month && month.focus(options)
}

export interface MonthModifierPredicateMap {
  selected: ModifierFn
  current: ModifierFn
  [key: string]: ModifierFn
}

export type MonthModifierStyleMap = { [key in keyof MonthModifierPredicateMap]: (theme: Theme) => Interpolation }

export const defaultModifiers: MonthModifierPredicateMap = {
  current: (month: ReferenceMonth) =>
    isSameReferenceMonth({ month: new Date().getMonth(), year: new Date().getFullYear() }, month),
  selected: () => false,
}

export const defaultModifierStyles: MonthModifierStyleMap = {
  current: () => ({
    fontWeight: 'bold',
    textDecoration: 'underline',
  }),
  selected: (theme: Theme) => ({
    background: theme.pallete.primary.main,
    color: theme.pallete.surface.main,
    ':hover': {
      background: theme.pallete.primary.main + '!important',
      color: theme.pallete.surface.main,
    },
  }),
}

export const createMonthStylesFn = (
  modifiers: MonthModifierPredicateMap,
  styles: MonthModifierStyleMap,
  theme: Theme
) => (month: ReferenceMonth): Interpolation => {
  return Object.keys(modifiers).reduce((s, modifier) => {
    if (!styles[modifier]) {
      throw new Error(`You must provied a modifierStyle for predicate "${modifier}"`)
    }
    return {
      ...s,
      ...(modifiers[modifier](month, null) ? (styles[modifier](theme) as any) : {}),
    }
  }, {})
}

export const createStyles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.pallete.surface.main,
    display: 'inline-block',
    padding: '1rem',
    border: `1px solid ${theme.pallete.divider}`,
    boxShadow: theme.shadows.outer['20'],
    borderRadius: theme.radius.popper,
  } as CSSProperties,
  header: {
    padding: '0rem 1.5rem 0rem 1rem',
  } as CSSProperties,
  months: {
    margin: '-0.25rem -0.25rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    alignItems: 'center',
  } as CSSProperties,
  item: {
    textAlign: 'center',
    margin: '0.25rem 0.25rem',
    borderRadius: '0.25rem',
  } as CSSProperties,
  button: {
    padding: 'calc(0.25rem - 1px) 1rem',
    transitionProperty: 'background',
    minWidth: '70px',
  } as CSSProperties,
  active: {
    background: theme.pallete.primary.main,
    color: theme.pallete.surface.main,
  } as CSSProperties,
})
