import React from 'react'

import { DropdownItem, DropdownItemProps } from './DropdownItem'

export interface DropdownCheckboxItemProps extends Omit<DropdownItemProps, 'icon' | 'onChange'> {
  checked: boolean

  /**
   * Called with the new state when the user picks the item
   */
  onCheckedChange?(checked: boolean): void
}

/**
 * Item of a `Dropdown` that turns an option on and off, such as "Show hidden files". Picking it keeps the menu
 * open, so the user can change several options.
 */
export function DropdownCheckboxItem(props: DropdownCheckboxItemProps) {
  const { checked, onCheckedChange, onClick, disabled, ...rest } = props

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // Keeps the menu open
    e.stopPropagation()
    if (!disabled) {
      onCheckedChange && onCheckedChange(!checked)
      onClick && onClick(e)
    }
  }

  return (
    <DropdownItem
      role='menuitemcheckbox'
      aria-checked={checked}
      icon={checked ? 'checkDefault' : null}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    />
  )
}
