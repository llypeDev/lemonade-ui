import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { AvatarProps, AvatarSize } from '../Avatar'

export interface AvatarGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * The `Avatar`s of the group
   */
  children?: React.ReactNode

  /**
   * Number of avatars shown. The others are summed up in a "+N" circle.
   * @default 4
   */
  max?: number

  /**
   * Size of all the avatars of the group
   * @default 'medium'
   */
  size?: AvatarSize

  style?: ExternalStyles
}

/**
 * Overlapping avatars of a group of people, such as the members of a project, with a "+N" for the ones that do
 * not fit. Name the group with `aria-label`.
 */
export function AvatarGroup(props: AvatarGroupProps) {
  const { children, max = 4, size = 'medium', style, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, size)

  const avatars = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<AvatarProps>[]
  // The "+N" takes a place of its own, so it never stands for a single avatar
  const shown = avatars.length > max ? avatars.slice(0, Math.max(max - 1, 0)) : avatars
  const hidden = avatars.slice(shown.length)
  const hiddenNames = hidden.map((avatar) => avatar.props.name).filter(Boolean)
  const moreLabel = locale.avatarGroup.more.replace('{count}', String(hidden.length))

  return (
    <div role='group' className={css(classes.group, style)} {...rest}>
      {shown.map((avatar, index) =>
        React.cloneElement(avatar, {
          key: avatar.key ?? index,
          size,
          style: css(classes.item, avatar.props.style as any),
        })
      )}
      {hidden.length > 0 && (
        <span
          role='img'
          aria-label={hiddenNames.length ? `${moreLabel}: ${hiddenNames.join(', ')}` : moreLabel}
          title={hiddenNames.join(', ') || undefined}
          className={css(classes.item, classes.more)}
        >
          <span aria-hidden='true'>+{hidden.length}</span>
        </span>
      )}
    </div>
  )
}

const sizes: Record<AvatarSize, { size: string; fontSize: string }> = {
  small: { size: '1.5rem', fontSize: '0.625rem' },
  medium: { size: '2.5rem', fontSize: '0.875rem' },
  large: { size: '4rem', fontSize: '1.375rem' },
}

const createStyles = (theme: Theme, size: AvatarSize) => ({
  group: {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    // Room for the overlap of the first avatar
    paddingLeft: size === 'small' ? '0.25rem' : '0.5rem',
  } as CSSProperties,
  item: {
    // Small avatars overlap less, so their initials stay readable
    marginLeft: size === 'small' ? '-0.25rem' : '-0.5rem',
    // A ring of the surface color separates the avatars where they overlap
    boxShadow: `0 0 0 2px ${theme.pallete.surface.main}`,
  } as CSSProperties,
  more: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: sizes[size].size,
    height: sizes[size].size,
    borderRadius: '50%',
    background: theme.pallete.surface.background,
    color: theme.pallete.text.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: sizes[size].fontSize,
    fontWeight: 'bold',
    lineHeight: 1,
    cursor: 'default',
  } as CSSProperties,
})
