import React, { AnchorHTMLAttributes, CSSProperties } from 'react'

import { focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { BaseTextProps, Text } from '../Text'

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'style'> & BaseTextProps

export function Link<P = LinkProps>(props: P & BaseTextProps) {
  const { classes } = useStyles(createStyles, props)

  return <Text<LinkProps> variant='link' component='a' {...props} style={[classes.link, props.style]} />
}

export const createStyles = (theme: Theme) => ({
  link: {
    cursor: 'pointer',
    outline: 'none',
    transition: 'box-shadow .2s ease',
    '&:hover': {
      textDecoration: 'none',
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
    // Only the keyboard shows the ring, not a click. Browsers without :focus-visible drop this rule and show it.
    '&:focus:not(:focus-visible)': {
      boxShadow: 'none',
    },
    // The underline and the corners change with the ring only, so a click leaves them as they are
    '&:focus-visible': {
      textDecoration: 'none',
      borderRadius: theme.radius.input,
    },
  } as CSSProperties,
})
