import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface KbdProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * Keys of a shortcut, such as `['Ctrl', 'K']`, shown with a separator between them.
   * Without it, the children are a single key.
   */
  keys?: string[]

  /**
   * Text between the keys of a shortcut
   * @default '+'
   */
  separator?: React.ReactNode

  children?: React.ReactNode
  style?: ExternalStyles
}

export const monospaceFontFamily = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"

/**
 * A key or a keyboard shortcut, such as Ctrl + K, to mention in a text, a tooltip or a menu.
 */
export function Kbd(props: KbdProps) {
  const { keys, separator = '+', children, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  if (!keys) {
    return (
      <kbd className={css(classes.key, style)} {...rest}>
        {children}
      </kbd>
    )
  }

  // A shortcut is a kbd with a kbd for each key, as the HTML spec suggests
  return (
    <kbd className={css(classes.shortcut, style)} {...rest}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className={classes.separator}>{separator}</span>}
          <kbd className={classes.key}>{key}</kbd>
        </React.Fragment>
      ))}
    </kbd>
  )
}

const createStyles = (theme: Theme) => ({
  key: {
    display: 'inline-block',
    boxSizing: 'border-box',
    minWidth: '1.5rem',
    padding: '0 0.375rem',
    fontFamily: monospaceFontFamily,
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '1.25rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    color: theme.pallete.text.main,
    background: theme.pallete.surface.background,
    border: `1px solid ${theme.pallete.gray.c70}`,
    borderBottomWidth: 2,
    borderRadius: theme.radius.button,
  } as CSSProperties,
  shortcut: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontFamily: theme.typography.fontFamily,
    whiteSpace: 'nowrap',
  } as CSSProperties,
  separator: {
    color: theme.pallete.text.secondary,
    fontSize: '0.75rem',
  } as CSSProperties,
})
