import React, { CSSProperties } from 'react'
import { Button, ButtonProps } from '../Button'
import { Theme, useStyles } from '../../styles'

export interface ModalFooterButtonProps extends Omit<ButtonProps, 'size'> {}

export function ModalFooterButton(props: ModalFooterButtonProps) {
  const { style, ...rest } = props

  const { classes } = useStyles(createStyles)

  return <Button style={[classes.button, style]} {...rest} />
}

const createStyles = (theme: Theme) => ({
  button: {
    minWidth: '9rem',
    [theme.breakpoints.down('sm')]: {
      // As wide as its label, so the buttons fit side by side
      minWidth: 'auto',
    },
  } as CSSProperties,
})
