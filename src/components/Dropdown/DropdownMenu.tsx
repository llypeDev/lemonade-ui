import React from 'react'

import { useRovingTabIndex } from '../../hooks/useRovingTabIndex'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { composeRefs } from '../../util/react'

export interface DropdownMenuProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'style'> {
  innerRef?: React.Ref<HTMLUListElement>
  style?: ExternalStyles
}

/**
 * Items of a menu that can take the focus: plain items, checkbox and radio items, and submenus
 */
export const menuItemSelector = '[role^="menuitem"]:not([aria-disabled="true"])'

export function DropdownMenu(props: DropdownMenuProps) {
  const { innerRef, style, ...rest } = props
  const { css, classes } = useStyles(styles)

  const rootRef = useRovingTabIndex({
    // The items of this menu, not those of its submenus; the left and right arrows open and close submenus
    getItems: (root) =>
      Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
        (item) => item.parentElement.closest('[role="menu"]') === root
      ),
    nextKeys: ['ArrowDown'],
    prevKeys: ['ArrowUp'],
  })

  return <ul ref={composeRefs(innerRef, rootRef)} className={css(classes.root, style)} role='menu' {...rest} />
}

export const styles = (theme: Theme) => ({
  root: {
    listStyle: 'none',
    margin: 0,
    padding: 'calc(0.5rem - 1px) 0',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.09)',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.popper,
    display: 'inline-block',
    width: 'auto',
    minWidth: '150px',
    background: theme.pallete.surface.main,
  } as React.CSSProperties,
})
