import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Badge } from '../Badge'
import { Icon, IconImage } from '../Icon'
import { VisuallyHidden } from '../VisuallyHidden'

export interface BottomNavigationItem {
  /**
   * Unique id of the destination, compared with `active`
   */
  id: string

  /**
   * Short name, of one or two words
   */
  label: string

  icon: IconImage

  /**
   * Number of new things in the destination, such as unread messages
   */
  badge?: number

  /**
   * Makes the item a link
   */
  href?: string

  onClick?(event: React.MouseEvent<HTMLElement>): void

  /**
   * Element that renders the item, such as the `Link` of your router; other props of the item go to it
   * @default 'a' with `href`, 'button' without it
   */
  component?: React.ElementType

  [prop: string]: any
}

export interface BottomNavigationProps {
  /**
   * Three to five destinations
   */
  items: BottomNavigationItem[]

  /**
   * Id of the current destination
   */
  active?: string

  /**
   * Name of the navigation for screen readers
   * @default "Main", from the locale strings
   */
  label?: string

  /**
   * Fixes the bar to the bottom of the screen
   * @default true
   */
  fixed?: boolean

  style?: ExternalStyles
}

/**
 * A bar at the bottom of the screen with the main destinations of an application, for small screens, such as
 * Home, Orders and Profile. On larger screens, prefer a `SideNav`.
 */
export function BottomNavigation(props: BottomNavigationProps) {
  const { items, active, label, fixed = true, style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)

  return (
    <nav
      aria-label={label ?? locale.bottomNavigation.label}
      className={css(classes.root, fixed && classes.fixed, style)}
    >
      <ul className={classes.list}>
        {items.map((item) => {
          const { id, label: itemLabel, icon, badge, component, href, onClick, ...rest } = item
          const Component = component ?? (href ? 'a' : 'button')
          const current = id === active

          return (
            <li key={id} className={classes.entry}>
              <Component
                href={href}
                type={Component === 'button' ? 'button' : undefined}
                className={css(classes.item, current && classes.current)}
                aria-current={current ? 'page' : undefined}
                onClick={onClick}
                {...rest}
              >
                <Badge count={badge} max={99}>
                  <Icon icon={icon} size={1.5} />
                </Badge>
                <span className={classes.label}>{itemLabel}</span>
                {!!badge && <VisuallyHidden>, {badge}</VisuallyHidden>}
              </Component>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    boxSizing: 'border-box',
    width: '100%',
    background: theme.pallete.surface.main,
    borderTop: `1px solid ${theme.pallete.divider}`,
    // Keeps the items above the home indicator of phones without a home button
    paddingBottom: 'env(safe-area-inset-bottom)',
  } as CSSProperties,
  fixed: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.popper,
    boxShadow: '0 -2px 4px 0 rgba(0, 0, 0, 0.06)',
  } as CSSProperties,
  list: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as CSSProperties,
  entry: {
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  item: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.125rem',
    width: '100%',
    minHeight: '3.5rem',
    boxSizing: 'border-box',
    margin: 0,
    padding: '0.375rem 0.25rem',
    border: 0,
    background: 'transparent',
    color: theme.pallete.text.secondary,
    font: 'inherit',
    fontSize: '0.75rem',
    textDecoration: 'none',
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      color: theme.pallete.text.main,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
  } as CSSProperties,
  current: {
    color: theme.pallete.primary.main,
    fontWeight: 'bold',
    // A line on top marks the current destination, besides the color
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '25%',
      right: '25%',
      height: 3,
      borderRadius: '0 0 3px 3px',
      background: theme.pallete.primary.main,
    },
    '&:hover': {
      color: theme.pallete.primary.main,
    },
  } as CSSProperties,
  label: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSProperties,
})
