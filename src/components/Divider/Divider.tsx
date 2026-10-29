import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * @default 'horizontal'
   */
  orientation?: DividerOrientation

  /**
   * Short text in the middle of a horizontal divider, such as "or"
   */
  label?: React.ReactNode

  /**
   * Space around the line, in rem: above and below a horizontal divider, on the sides of a vertical one
   * @default 1
   */
  spacing?: number

  style?: ExternalStyles
}

/**
 * A line that separates groups of content. Use a vertical divider inside a horizontal `Flow`, such as between
 * toolbar buttons.
 */
export function Divider(props: DividerProps) {
  const { orientation = 'horizontal', label, spacing = 1, style, ...rest } = props
  const { classes, css } = useStyles(createStyles, spacing)

  if (orientation === 'vertical') {
    return (
      <div
        role='separator'
        aria-orientation='vertical'
        className={css(classes.base, classes.vertical, style)}
        {...rest}
      />
    )
  }

  if (label) {
    return (
      <div
        role='separator'
        aria-label={typeof label === 'string' ? label : undefined}
        className={css(classes.labeled, style)}
        {...rest}
      >
        <span className={classes.label}>{label}</span>
      </div>
    )
  }

  return <hr className={css(classes.base, classes.horizontal, style)} {...rest} />
}

const createStyles = (theme: Theme, spacing: number) => ({
  base: {
    flexShrink: 0,
    margin: 0,
    border: 'none',
    background: theme.pallete.divider,
  } as CSSProperties,
  horizontal: {
    height: 1,
    width: '100%',
    margin: `${spacing}rem 0`,
  } as CSSProperties,
  vertical: {
    width: 1,
    alignSelf: 'stretch',
    minHeight: '1em',
    margin: `0 ${spacing}rem`,
  } as CSSProperties,
  labeled: {
    ...theme.typography.variant('main'),
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: `${spacing}rem 0`,
    color: theme.pallete.text.secondary,
    '&::before, &::after': {
      content: '""',
      flex: 1,
      height: 1,
      background: theme.pallete.divider,
    },
  } as CSSProperties,
  label: {
    flexShrink: 0,
    fontWeight: 'bold',
  } as CSSProperties,
})
