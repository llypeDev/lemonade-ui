import React, { useContext } from 'react'

import { ExternalStyles, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Icon, IconImage } from '../Icon'

import { SideNavLevelContext } from './SideNav'
import { createItemStyles } from './sideNavStyles'

export interface SideNavItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * Element that renders the link, such as the `Link` of your router
   * @default 'a'
   */
  component?: React.ElementType

  /**
   * Marks the item of the current page, with `aria-current="page"`
   */
  active?: boolean

  icon?: IconImage

  /**
   * Content at the end of the item, such as a `Badge`
   */
  extra?: React.ReactNode

  children?: React.ReactNode
  style?: ExternalStyles
  [key: string]: any
}

/**
 * A link of the `SideNav`. Props it does not use, such as `href` or a router's `to`, go to the link element.
 */
export function SideNavItem(props: SideNavItemProps) {
  const { component: Component = 'a', active, icon, extra, children, style, ...rest } = props
  const level = useContext(SideNavLevelContext)
  const { classes, css } = useStyles(createItemStyles, level)

  return (
    <li>
      <Component
        className={css(classes.item, active && classes.active, style)}
        aria-current={active ? 'page' : undefined}
        {...rest}
      >
        {icon && <Icon icon={icon} size={1.5} style={classes.icon} />}
        <span className={classes.label}>{children}</span>
        {extra}
      </Component>
    </li>
  )
}
