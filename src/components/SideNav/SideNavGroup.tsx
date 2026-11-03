import React, { CSSProperties, useContext } from 'react'

import { useCollapse } from '../../hooks/useCollapse'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { useExpandable, UseExpandableProps } from '../Accordion/useExpandable'
import { Icon, IconImage } from '../Icon'

import { SideNavLevelContext } from './SideNav'
import { createItemStyles } from './sideNavStyles'

export interface SideNavGroupProps extends UseExpandableProps {
  title: React.ReactNode
  icon?: IconImage

  /**
   * `SideNavItem` elements, or other groups
   */
  children?: React.ReactNode

  style?: ExternalStyles
}

/**
 * A group of `SideNav` items that slides open and closed. It starts expanded when one of its items is active,
 * unless `defaultExpanded` says otherwise.
 */
export function SideNavGroup(props: SideNavGroupProps) {
  const { title, icon, children, expanded, defaultExpanded, onChange, style } = props
  const level = useContext(SideNavLevelContext)
  const hasActive = hasActiveItem(children)

  const { expanded: isExpanded, toggle, headerId, contentId } = useExpandable({
    expanded,
    defaultExpanded: defaultExpanded ?? hasActive,
    onChange,
  })
  // The items slide open and closed, and stay out of the tab order and screen readers while collapsed
  const collapse = useCollapse<HTMLUListElement>(isExpanded)

  const { classes: itemClasses, css } = useStyles(createItemStyles, level)
  const { classes } = useStyles(createStyles)

  return (
    <li>
      <button
        type='button'
        id={headerId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={toggle}
        className={css(itemClasses.item, hasActive && !isExpanded && classes.containsActive, style)}
      >
        {icon && <Icon icon={icon} size={1.5} style={itemClasses.icon} />}
        <span className={itemClasses.label}>{title}</span>
        <Icon icon='angleDown' size={1} style={css(classes.chevron, isExpanded && classes.chevronExpanded)} />
      </button>
      <ul
        ref={collapse.ref}
        id={contentId}
        aria-labelledby={headerId}
        hidden={collapse.hidden}
        className={classes.list}
      >
        <SideNavLevelContext.Provider value={level + 1}>{children}</SideNavLevelContext.Provider>
      </ul>
    </li>
  )
}

/**
 * Whether one of the items, at any depth, is active
 */
const hasActiveItem = (children: React.ReactNode): boolean =>
  React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && (child.props.active || hasActiveItem(child.props.children))
  )

const createStyles = (theme: Theme) => ({
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as CSSProperties,
  chevron: {
    flexShrink: 0,
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  chevronExpanded: {
    transform: 'rotate(180deg)',
  } as CSSProperties,
  containsActive: {
    fontWeight: 'bold',
    color: theme.pallete.primary.c40,
  } as CSSProperties,
})
