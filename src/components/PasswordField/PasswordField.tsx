import React, { useState } from 'react'

import { useLocale } from '../../i18n'
import { Omit } from '../../util'
import { TextField, TextFieldProps } from '../TextField'

export interface PasswordFieldProps
  extends Omit<
    TextFieldProps,
    'type' | 'icon' | 'iconPosition' | 'iconAriaLabel' | 'iconDisabled' | 'onIconClick' | 'iconProps'
  > {
  /**
   * Whether the password starts visible
   * @default false
   */
  defaultVisible?: boolean

  /**
   * Called when the user shows or hides the password
   */
  onVisibleChange?(visible: boolean): void
}

/**
 * Text field for passwords, with a button that shows and hides what was typed.
 */
export function PasswordField(props: PasswordFieldProps) {
  const { defaultVisible = false, onVisibleChange, autoComplete = 'current-password', ...rest } = props
  const locale = useLocale()
  const [visible, setVisible] = useState(defaultVisible)

  const toggle = () => {
    setVisible(!visible)
    onVisibleChange && onVisibleChange(!visible)
  }

  return (
    <TextField
      clearable={false}
      {...rest}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      spellCheck={false}
      autoCapitalize='off'
      icon={visible ? 'eyeHiddenOutline' : 'eyeOutline'}
      iconPosition='right'
      iconAriaLabel={locale.passwordField.show}
      onIconClick={toggle}
      // The input wrapper keeps icon buttons out of the tab order, but this one must be reachable by keyboard
      iconProps={{ tabIndex: 0, 'aria-pressed': visible, title: locale.passwordField.show }}
    />
  )
}
