import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { usePopper } from 'react-popper'

import { Theme, useStyles } from '../../styles'
import { Icon, IconImage } from '../Icon'

import { DropdownItem } from './DropdownItem'
import { DropdownMenu, menuItemSelector } from './DropdownMenu'

export interface DropdownSubmenuProps {
  /**
   * Text of the item that opens the submenu
   */
  label: string

  /**
   * Icon before the text
   */
  icon?: IconImage | null

  disabled?: boolean

  /**
   * Items of the submenu
   */
  children?: React.ReactNode
}

/**
 * Item of a `Dropdown` that opens a menu beside it, such as "Move to" with the list of folders. The pointer, Enter,
 * Space and the right arrow open it; the left arrow and Escape close it.
 */
export function DropdownSubmenu(props: DropdownSubmenuProps) {
  const { label, icon, disabled, children } = props
  const { classes } = useStyles(createStyles)
  const [open, setOpen] = useState(false)
  // The item takes the box of the trigger, since the submenu inside it is positioned apart
  const [rootRef, setRootRef] = useState<HTMLLIElement>(null)
  const [menuRef, setMenuRef] = useState<HTMLUListElement>(null)
  // Only the keyboard moves the focus into the submenu; the pointer just shows it
  const focusOnOpen = useRef(false)

  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(rootRef, menuRef, {
    placement: 'right-start',
    // Lines the first item of the submenu up with the item that opens it
    modifiers: [{ name: 'offset', options: { offset: [-8, 0] } }],
  })

  useEffect(() => {
    if (menuRef && focusOnOpen.current) {
      focusOnOpen.current = false
      const first = menuRef.querySelector<HTMLElement>(menuItemSelector)
      first && first.focus()
    }
  }, [menuRef])

  const show = (withKeyboard: boolean) => {
    if (disabled) {
      return
    }
    focusOnOpen.current = withKeyboard
    if (open && withKeyboard && menuRef) {
      const first = menuRef.querySelector<HTMLElement>(menuItemSelector)
      first && first.focus()
    }
    setOpen(true)
  }

  const close = (restoreFocus: boolean) => {
    setOpen(false)
    const trigger = rootRef && (rootRef.firstElementChild as HTMLElement)
    restoreFocus && trigger && trigger.focus()
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault()
      show(true)
    }
  }

  // The item that opens the submenu does not close the dropdown
  const handleTriggerClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    open ? close(false) : show(false)
  }

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      // Escape closes only the submenu, not the dropdown that listens on the document
      e.nativeEvent.stopImmediatePropagation()
      close(true)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLLIElement>) => {
    const next = e.relatedTarget as Node
    if (next && !e.currentTarget.contains(next)) {
      setOpen(false)
    }
  }

  return (
    <li
      ref={setRootRef}
      role='none'
      className={classes.root}
      onMouseEnter={() => show(false)}
      onMouseLeave={() => setOpen(false)}
      onBlur={handleBlur}
    >
      <DropdownItem
        component='div'
        icon={icon}
        disabled={disabled}
        aria-haspopup='menu'
        aria-expanded={open}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={classes.label}>
          {label}
          <Icon icon='angleRight' size={1} style={classes.chevron} />
        </span>
      </DropdownItem>
      {open && (
        <DropdownMenu
          innerRef={setMenuRef}
          aria-label={label}
          style={[popperStyle as any, classes.menu]}
          onKeyDown={handleMenuKeyDown}
          {...popperAttributes}
        >
          {children}
        </DropdownMenu>
      )}
    </li>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    listStyle: 'none',
  } as CSSProperties,
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  } as CSSProperties,
  chevron: {
    flexShrink: 0,
  } as CSSProperties,
  menu: {
    zIndex: theme.zIndex.dropdown,
  } as CSSProperties,
})
