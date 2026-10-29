import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { VisuallyHidden } from '../VisuallyHidden'

export type BadgeType = 'danger' | 'info' | 'success' | 'alert' | 'normal'

export type BadgeOverlap = 'rectangular' | 'circular'

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'style'> {
  /**
   * Number shown in the badge
   */
  count?: number

  /**
   * Largest number shown; bigger counts show as `max+`
   * @default 99
   */
  max?: number

  /**
   * Shows a small dot instead of the count
   */
  dot?: boolean

  /**
   * Shows the badge when `count` is 0
   */
  showZero?: boolean

  /**
   * @default 'danger'
   */
  type?: BadgeType

  /**
   * Text read by screen readers instead of the number or the dot, such as "3 unread messages".
   * Without it, the badge is hidden from them, so put the count in the name of the element it decorates.
   */
  label?: string

  /**
   * Use `circular` to place the badge on the edge of a round element, such as an `Avatar`
   * @default 'rectangular'
   */
  overlap?: BadgeOverlap

  /**
   * Element the badge is placed on. Without children, the badge is shown inline, like a counter next to a label.
   */
  children?: React.ReactNode

  style?: ExternalStyles
}

/**
 * A count or a dot on the corner of an element, to call attention to something new.
 */
export function Badge(props: BadgeProps) {
  const {
    count,
    max = 99,
    dot,
    showZero,
    type = 'danger',
    label,
    overlap = 'rectangular',
    children,
    style,
    ...rest
  } = props

  const { classes, css } = useStyles(createStyles)

  const hasCount = typeof count === 'number' && (count !== 0 || showZero)
  const visible = dot || hasCount
  const standalone = children === undefined || children === null
  const content = count > max ? `${max}+` : count

  const indicator = visible && (
    <span
      className={css(
        classes.indicator,
        classes[type],
        dot ? classes.dot : classes.count,
        !standalone && classes.positioned,
        !standalone && overlap === 'circular' && classes.circular,
        standalone && style
      )}
      aria-hidden={!label ? 'true' : undefined}
      {...(standalone ? rest : {})}
    >
      {!dot && <span aria-hidden={label ? 'true' : undefined}>{content}</span>}
      {label && <VisuallyHidden>{label}</VisuallyHidden>}
    </span>
  )

  if (standalone) {
    return indicator || null
  }

  return (
    <span className={css(classes.wrapper, style)} {...rest}>
      {children}
      {indicator}
    </span>
  )
}

const createStyles = (theme: Theme) => ({
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    // Keeps the badge on the corner of its child when a grid or a flex column would stretch the wrapper
    width: 'fit-content',
    maxWidth: '100%',
    verticalAlign: 'middle',
    flexShrink: 0,
  } as CSSProperties,
  indicator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  } as CSSProperties,
  count: {
    minWidth: '1.25rem',
    height: '1.25rem',
    padding: '0 0.375rem',
    borderRadius: '0.625rem',
    fontSize: '0.75rem',
    lineHeight: 1,
  } as CSSProperties,
  dot: {
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: '50%',
  } as CSSProperties,
  positioned: {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translate(50%, -50%)',
    boxShadow: `0 0 0 2px ${theme.pallete.surface.main}`,
    pointerEvents: 'none',
  } as CSSProperties,
  circular: {
    top: '14%',
    right: '14%',
  } as CSSProperties,
  normal: {
    background: theme.pallete.gray.c20,
    color: theme.pallete.gray.c100,
  } as CSSProperties,
  danger: {
    background: theme.pallete.status.danger.main,
    color: theme.pallete.status.danger.onColor,
  } as CSSProperties,
  info: {
    background: theme.pallete.status.info.main,
    color: theme.pallete.status.info.onColor,
  } as CSSProperties,
  success: {
    background: theme.pallete.status.success.main,
    color: theme.pallete.status.success.onColor,
  } as CSSProperties,
  alert: {
    background: theme.pallete.status.alert.main,
    color: theme.pallete.status.alert.onColor,
  } as CSSProperties,
})
