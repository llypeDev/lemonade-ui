import React, { CSSProperties } from 'react'

import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'title'> {
  /**
   * Main text of the item, such as a name
   */
  title: React.ReactNode

  /**
   * Second line, such as an email or a date
   */
  description?: React.ReactNode

  /**
   * Content before the text, such as an `Avatar` or an `Icon`
   */
  media?: React.ReactNode

  /**
   * Content at the end of the item, such as a `Badge`, a `Tag` or buttons. It stays outside the link or the
   * button of an interactive item.
   */
  extra?: React.ReactNode

  /**
   * Makes the item a link
   */
  href?: string

  /**
   * Makes the item a button
   */
  onClick?(event: React.MouseEvent<HTMLElement>): void

  /**
   * Element that renders an interactive item, such as the `Link` of your router
   * @default 'a' with `href`, 'button' with `onClick`
   */
  component?: React.ElementType

  disabled?: boolean
  style?: ExternalStyles
  [key: string]: any
}

/**
 * An item of a `List`. With `href`, `onClick` or `component`, the item becomes a link or a button; props it
 * does not use, such as a router's `to`, go to that element.
 */
export function ListItem(props: ListItemProps) {
  const { title, description, media, extra, component, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  const interactive = !!(component || rest.href || rest.onClick)
  const Component = component ?? (rest.href ? 'a' : 'button')

  const content = (
    <>
      {media && <span className={classes.media}>{media}</span>}
      <span className={classes.text}>
        <span className={classes.title}>{title}</span>
        {description && <span className={classes.description}>{description}</span>}
      </span>
    </>
  )

  if (!interactive) {
    return (
      <li className={css(classes.item, style)} {...rest}>
        <div className={css(classes.main, !!extra && classes.mainWithExtra)}>{content}</div>
        {extra && <div className={classes.extra}>{extra}</div>}
      </li>
    )
  }

  return (
    <li className={css(classes.item, classes.interactiveItem, style)}>
      <Component
        className={css(classes.main, classes.interactive, !!extra && classes.mainWithExtra)}
        type={Component === 'button' ? 'button' : undefined}
        {...rest}
      >
        {content}
      </Component>
      {extra && <div className={css(classes.extra, classes.extraOverLink)}>{extra}</div>}
    </li>
  )
}

const createStyles = (theme: Theme) => ({
  item: {
    display: 'flex',
    alignItems: 'center',
  } as CSSProperties,
  main: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
    padding: '0.75rem 1rem',
  } as CSSProperties,
  mainWithExtra: {
    paddingRight: '0.5rem',
  } as CSSProperties,
  interactiveItem: {
    position: 'relative',
    transition: 'background .2s',
    '&:hover': {
      background: theme.pallete.surface.background,
    },
  } as CSSProperties,
  interactive: {
    margin: 0,
    border: 0,
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    textDecoration: 'none',
    cursor: 'pointer',
    outline: 'none',
    // Stretches the click area and the focus ring over the whole row, extra content included
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    '&:focus::after': {
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
    '&:disabled, &[aria-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  } as CSSProperties,
  media: {
    display: 'flex',
    flexShrink: 0,
  } as CSSProperties,
  text: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  } as CSSProperties,
  title: {
    fontWeight: 'bold',
    overflowWrap: 'anywhere',
  } as CSSProperties,
  description: {
    color: theme.pallete.text.secondary,
    overflowWrap: 'anywhere',
  } as CSSProperties,
  extra: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
    paddingRight: '1rem',
  } as CSSProperties,
  extraOverLink: {
    // Clicks on plain content, such as a badge, reach the link below; controls, such as buttons, stay usable
    position: 'relative',
    pointerEvents: 'none',
    '& a, & button, & input, & select, & textarea, & [tabindex]': {
      pointerEvents: 'auto',
    },
  } as CSSProperties,
})
