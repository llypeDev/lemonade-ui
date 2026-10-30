import React, { CSSProperties, useState } from 'react'

import { Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Button, ButtonProps } from '../Button'

export interface ToggleButtonProps extends Omit<ButtonProps, 'onChange'> {
  /**
   * Whether the button is on, for a controlled button
   */
  pressed?: boolean

  /**
   * Whether an uncontrolled button starts on
   * @default false
   */
  defaultPressed?: boolean

  /**
   * Called when the user turns the button on or off
   */
  onPressedChange?(pressed: boolean): void
}

/**
 * Button that turns an option on and off, such as bold in a text editor or a filter. Keep its label the same in
 * both states: screen readers announce whether it is pressed.
 */
export function ToggleButton(props: ToggleButtonProps) {
  const { pressed, defaultPressed = false, onPressedChange, onClick, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)
  const [internalPressed, setInternalPressed] = useState(defaultPressed)
  const isPressed = pressed ?? internalPressed

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick && onClick(e)

    if (e.defaultPrevented) {
      return
    }

    if (pressed === undefined) {
      setInternalPressed(!isPressed)
    }
    onPressedChange && onPressedChange(!isPressed)
  }

  return (
    <Button aria-pressed={isPressed} onClick={handleClick} style={css(isPressed && classes.pressed, style)} {...rest} />
  )
}

const createStyles = (theme: Theme) => ({
  pressed: {
    backgroundColor: theme.pallete.primary.c90,
    color: theme.pallete.primary.c40,
    ':not(:disabled):hover': {
      backgroundColor: theme.pallete.primary.c80,
    },
  } as CSSProperties,
})
