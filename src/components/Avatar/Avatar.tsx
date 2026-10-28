import React, { CSSProperties, useState } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Icon } from '../Icon'

export type AvatarSize = 'small' | 'medium' | 'large'

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'style'> {
  /**
   * Image of the person. When it is missing or fails to load, the initials of `name` are shown instead.
   */
  src?: string

  /**
   * Name of the person, used for the initials and as the accessible name.
   * Without it, the avatar is treated as decorative.
   */
  name?: string

  /**
   * @default 'medium'
   */
  size?: AvatarSize

  style?: ExternalStyles
}

/**
 * Shows a person as a picture, their initials or a generic user icon, in this order of preference.
 */
export function Avatar(props: AvatarProps) {
  const { src, name, size = 'medium', style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  // Remembers which image failed, so a new src is tried again
  const [failedSrc, setFailedSrc] = useState<string>()
  const imageFailed = failedSrc === src

  const initials = getInitials(name)
  const className = css(classes.avatar, classes[size], style)

  if (src && !imageFailed) {
    return (
      <span className={className} {...rest}>
        <img src={src} alt={name ?? ''} className={classes.image} onError={() => setFailedSrc(src)} />
      </span>
    )
  }

  if (initials) {
    return (
      <span role='img' aria-label={name} className={className} {...rest}>
        <span aria-hidden='true'>{initials}</span>
      </span>
    )
  }

  return (
    <span aria-hidden='true' className={className} {...rest}>
      <Icon icon='userFilled' style={classes.icon} />
    </span>
  )
}

/**
 * First letter of the first and of the last word of the name
 */
export const getInitials = (name: string): string => {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return ''
  }

  const first = words[0].charAt(0)
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : ''

  return (first + last).toLocaleUpperCase()
}

const createStyles = (theme: Theme) => ({
  avatar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: '50%',
    background: theme.pallete.primary.c90,
    color: theme.pallete.primary.c20,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    lineHeight: 1,
    userSelect: 'none',
    verticalAlign: 'middle',
  } as CSSProperties,
  small: {
    width: '1.5rem',
    height: '1.5rem',
    fontSize: '0.625rem',
  } as CSSProperties,
  medium: {
    width: '2.5rem',
    height: '2.5rem',
    fontSize: '0.875rem',
  } as CSSProperties,
  large: {
    width: '4rem',
    height: '4rem',
    fontSize: '1.375rem',
  } as CSSProperties,
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as CSSProperties,
  icon: {
    width: '60%',
    height: '60%',
  } as CSSProperties,
})
