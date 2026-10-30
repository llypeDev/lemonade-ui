import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import * as numberUtil from '../../util/number'
import { Icon, IconImage } from '../Icon'
import { VisuallyHidden } from '../VisuallyHidden'

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * What the number measures, such as "Revenue"
   */
  label: React.ReactNode

  /**
   * The number, already formatted, such as "R$ 12.430"
   */
  value: React.ReactNode

  /**
   * Change from a previous period, in percent, such as `12.5` or `-3`
   */
  change?: number

  /**
   * Text after the change, such as "vs last month"
   */
  description?: React.ReactNode

  /**
   * For numbers that are better when lower, such as costs or errors: a decrease shows in green and an increase
   * in red
   * @default false
   */
  lowerIsBetter?: boolean

  /**
   * Writes the change, without its sign
   * @default the absolute value with up to one decimal, in the user's locale, and a % sign
   */
  formatChange?(change: number): string

  /**
   * Icon before the label
   */
  icon?: IconImage

  style?: ExternalStyles
}

const defaultFormatChange = (change: number) => `${numberUtil.format(change, { maximumFractionDigits: 1 })}%`

/**
 * A number to highlight, such as a metric of a dashboard, with its label and how much it changed.
 */
export function Stat(props: StatProps) {
  const {
    label,
    value,
    change,
    description,
    lowerIsBetter = false,
    formatChange = defaultFormatChange,
    icon,
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)

  const hasChange = typeof change === 'number' && !isNaN(change)
  const direction = !hasChange || change === 0 ? 'none' : change > 0 ? 'up' : 'down'
  const good = direction !== 'none' && (direction === 'up') !== lowerIsBetter
  const tone = direction === 'none' ? classes.neutral : good ? classes.good : classes.bad
  const trendLabel =
    direction === 'up' ? locale.stat.increase : direction === 'down' ? locale.stat.decrease : locale.stat.noChange

  return (
    <div className={css(classes.root, style)} {...rest}>
      <div className={classes.label}>
        {icon && <Icon icon={icon} size={1} aria-hidden='true' />}
        <span>{label}</span>
      </div>
      <div className={classes.value}>{value}</div>
      {(hasChange || description) && (
        <div className={classes.footer}>
          {hasChange && (
            <span className={css(classes.change, tone)}>
              <Icon
                icon={direction === 'up' ? 'arrowUp' : direction === 'down' ? 'arrowDown' : 'minus'}
                size={1}
                aria-hidden='true'
              />
              <VisuallyHidden>{trendLabel} </VisuallyHidden>
              {formatChange(Math.abs(change))}
            </span>
          )}
          {description && <span className={classes.description}>{description}</span>}
        </div>
      )}
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: 0,
  } as CSSProperties,
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  value: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    lineHeight: 1.25,
    color: theme.pallete.text.main,
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  } as CSSProperties,
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: '0.5rem',
  } as CSSProperties,
  change: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.125rem',
    fontWeight: 'bold',
    fontVariantNumeric: 'tabular-nums',
  } as CSSProperties,
  good: {
    color: theme.pallete.status.success.main,
  } as CSSProperties,
  bad: {
    color: theme.pallete.status.danger.main,
  } as CSSProperties,
  neutral: {
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  description: {
    color: theme.pallete.text.secondary,
  } as CSSProperties,
})
