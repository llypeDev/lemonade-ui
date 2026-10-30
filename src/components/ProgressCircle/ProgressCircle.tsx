import { keyframes } from 'emotion'
import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, TextColor, Theme, useStyles } from '../../styles'
import { getTextColor } from '../../styles/theme/createTheme'
import { Omit } from '../../util'

export type ProgressCircleSize = 'small' | 'medium' | 'large'

export interface ProgressCircleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * Progress so far. Without it, the circle spins, for a wait of unknown length.
   */
  value?: number

  /**
   * @default 100
   */
  max?: number

  /**
   * @default 'medium'
   */
  size?: ProgressCircleSize

  /**
   * Shows the percentage in the middle of a medium or large circle
   * @default true
   */
  showValue?: boolean

  /**
   * @default 'primary'
   */
  type?: TextColor

  style?: ExternalStyles
}

const sizes: Record<ProgressCircleSize, number> = { small: 1.5, medium: 3, large: 4.5 }
const radius = 16
const circumference = 2 * Math.PI * radius

const spin = keyframes({ from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } })

/**
 * Circular progress of a task, such as an upload or the steps of a profile, or a spinning circle for a wait of
 * unknown length. For an amount within a range, such as storage use, use a `Meter`.
 */
export function ProgressCircle(props: ProgressCircleProps) {
  const { value, max = 100, size = 'medium', showValue = true, type = 'primary', style, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, size, type)

  const indeterminate = typeof value !== 'number'
  const ratio = indeterminate ? 0.25 : Math.min(Math.max(value / max, 0), 1)
  const percent = Math.round(ratio * 100)

  return (
    <div
      role='progressbar'
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuetext={indeterminate ? undefined : `${percent}%`}
      aria-label={rest['aria-labelledby'] ? undefined : indeterminate ? locale.progressCircle.loading : undefined}
      className={css(classes.root, style)}
      {...rest}
    >
      <svg viewBox='0 0 40 40' className={css(classes.svg, indeterminate && classes.spinning)} aria-hidden='true'>
        <circle cx='20' cy='20' r={radius} className={classes.track} />
        <circle
          cx='20'
          cy='20'
          r={radius}
          className={classes.bar}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      {!indeterminate && showValue && size !== 'small' && (
        <span className={classes.value} aria-hidden='true'>
          {percent}%
        </span>
      )}
    </div>
  )
}

const createStyles = (theme: Theme, size: ProgressCircleSize, type: TextColor) => ({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${sizes[size]}rem`,
    height: `${sizes[size]}rem`,
    flexShrink: 0,
    fontFamily: theme.typography.fontFamily,
  } as CSSProperties,
  svg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  } as CSSProperties,
  spinning: {
    animation: `${spin} 1s linear infinite`,
  } as CSSProperties,
  track: {
    fill: 'none',
    stroke: theme.pallete.divider,
    strokeWidth: size === 'small' ? 5 : 4,
  } as CSSProperties,
  bar: {
    fill: 'none',
    stroke: getTextColor(theme, type),
    strokeWidth: size === 'small' ? 5 : 4,
    strokeLinecap: 'round',
    transition: 'stroke-dashoffset .3s',
  } as CSSProperties,
  value: {
    position: 'absolute',
    fontSize: size === 'large' ? '1rem' : '0.75rem',
    fontWeight: 'bold',
    color: theme.pallete.text.main,
    fontVariantNumeric: 'tabular-nums',
  } as CSSProperties,
})
