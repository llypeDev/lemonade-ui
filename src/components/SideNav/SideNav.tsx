import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface SideNavProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * `SideNavItem` and `SideNavGroup` elements
   */
  children?: React.ReactNode

  /**
   * @default '16rem'
   */
  width?: number | string

  style?: ExternalStyles
}

/**
 * Fixed side menu with the main navigation of the application. It is a `nav` landmark: name it with
 * `aria-label`, such as "Main".
 */
export function SideNav(props: SideNavProps) {
  const { children, width = '16rem', style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  return (
    <nav className={css(classes.nav, { width }, style)} {...rest}>
      <ul className={classes.list}>{children}</ul>
    </nav>
  )
}

/**
 * Nesting depth of the items, used to indent them
 */
export const SideNavLevelContext = React.createContext(0)

const createStyles = (theme: Theme) => ({
  nav: {
    ...theme.typography.variant('main'),
    boxSizing: 'border-box',
    height: '100%',
    overflowY: 'auto',
    padding: '0.5rem 0',
    background: theme.pallete.surface.main,
    borderRight: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as CSSProperties,
})
