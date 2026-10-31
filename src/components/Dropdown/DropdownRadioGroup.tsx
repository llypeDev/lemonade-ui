import React, { useContext } from 'react'

import { DropdownGroup } from './DropdownGroup'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

interface RadioGroupContextValue {
  value: string
  onValueChange?(value: string): void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>(null)

export interface DropdownRadioGroupProps {
  /**
   * Title of the group, such as "Sort by"
   */
  label: React.ReactNode

  /**
   * Value of the checked item
   */
  value: string

  /**
   * Called with the value of the item the user picks
   */
  onValueChange?(value: string): void

  children?: React.ReactNode
}

/**
 * Items of a `Dropdown` where only one is checked, such as the order of a list. Picking an item keeps the menu
 * open.
 */
export function DropdownRadioGroup(props: DropdownRadioGroupProps) {
  const { label, value, onValueChange, children } = props

  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <DropdownGroup label={label}>{children}</DropdownGroup>
    </RadioGroupContext.Provider>
  )
}

export interface DropdownRadioItemProps extends Omit<DropdownItemProps, 'icon'> {
  value: string
}

/**
 * Item of a `DropdownRadioGroup`
 */
export function DropdownRadioItem(props: DropdownRadioItemProps) {
  const { value, onClick, disabled, ...rest } = props
  const group = useContext(RadioGroupContext)
  const checked = !!group && group.value === value

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // Keeps the menu open
    e.stopPropagation()
    if (!disabled) {
      group && group.onValueChange && group.onValueChange(value)
      onClick && onClick(e)
    }
  }

  return (
    <DropdownItem
      role='menuitemradio'
      aria-checked={checked}
      icon={checked ? 'checkDefault' : null}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    />
  )
}
