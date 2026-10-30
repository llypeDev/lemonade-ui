import React, { CSSProperties, useMemo } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'

export interface MeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  value: number

  /**
   * @default 0
   */
  min?: number

  /**
   * @default 100
   */
  max?: number

  /**
   * Text above the bar, which also names the meter for screen readers
   */
  label?: React.ReactNode

  /**
   * End of the low range. With `high` and `optimum`, it colors the bar by how good the value is.
   */
  low?: number

  /**
   * Start of the high range
   */
  high?: number

  /**
   * Best value, such as `0` for storage use or `max` for a battery. The range it is in shows in green, the
   * next one in orange and the farthest in red.
   * @default the middle between min and max
   */
  optimum?: number

  /**
   * Shows the value above the bar, on the right
   * @default true
   */
  showValue?: boolean

  /**
   * Text of the value, such as "7.2 GB of 10 GB", shown on the screen and read by screen readers
   */
  formatValue?(value: number): string

  style?: ExternalStyles
}

type Tone = 'primary' | 'good' | 'fair' | 'bad'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * An amount within a known range, such as storage use, a quota or a password strength. For the progress of a
 * task, use `Progress` or `ProgressCircle`.
 */
export function Meter(props: MeterProps) {
  const {
    value,
    min = 0,
    max = 100,
    label,
    low,
    high,
    optimum,
    showValue = true,
    formatValue,
    style,
    'aria-label': ariaLabel,
    ...rest
  } = props

  const labelId = useMemo(() => `meter-label-${randomStr()}`, [])

  const tone = useMemo<Tone>(() => {
    if (low === undefined && high === undefined) {
      return 'primary'
    }
    // Ranges as in the HTML meter element: below low, between low and high, above high
    const lowEnd = low ?? min
    const highStart = high ?? max
    const range = (v: number) => (v < lowEnd ? 0 : v > highStart ? 2 : 1)
    const distance = Math.abs(range(clamp(value, min, max)) - range(optimum ?? (min + max) / 2))
    return distance === 0 ? 'good' : distance === 1 ? 'fair' : 'bad'
  }, [value, min, max, low, high, optimum])

  const { classes, css } = useStyles(createStyles, tone)
  const ratio = max > min ? (clamp(value, min, max) - min) / (max - min) : 0
  const text = formatValue ? formatValue(value) : `${Math.round(ratio * 100)}%`

  return (
    <div className={css(classes.root, style)} {...rest}>
      {(label || showValue) && (
        <div className={classes.header}>
          {label && (
            <span id={labelId} className={classes.label}>
              {label}
            </span>
          )}
          {showValue && <span className={classes.value}>{text}</span>}
        </div>
      )}
      <div
        role='meter'
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={text}
        aria-labelledby={label ? labelId : undefined}
        aria-label={!label ? ariaLabel : undefined}
        className={classes.track}
      >
        <div className={classes.bar} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}

const createStyles = (theme: Theme, tone: Tone) => {
  const colors: Record<Tone, string> = {
    primary: theme.pallete.primary.main,
    good: theme.pallete.status.success.main,
    fair: theme.pallete.status.alert.main,
    bad: theme.pallete.status.danger.main,
  }

  return {
    root: {
      ...theme.typography.variant('main'),
      minWidth: 0,
    } as CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '0.25rem',
      lineHeight: '20px',
    } as CSSProperties,
    label: {
      fontWeight: 'bold',
    } as CSSProperties,
    value: {
      marginLeft: 'auto',
      color: theme.pallete.text.secondary,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    } as CSSProperties,
    track: {
      height: '0.5rem',
      borderRadius: '0.25rem',
      background: theme.pallete.divider,
      overflow: 'hidden',
    } as CSSProperties,
    bar: {
      height: '100%',
      borderRadius: 'inherit',
      background: colors[tone],
      transition: 'width .3s',
    } as CSSProperties,
  }
}
