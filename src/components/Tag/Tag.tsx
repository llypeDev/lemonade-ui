import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Icon, IconImage } from '../Icon'

export type TagType = 'normal' | 'danger' | 'info' | 'success' | 'alert'

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'style'> {
  type?: TagType
  style?: ExternalStyles
  icon?: IconImage
  height?: String
  removable?: boolean
  onRemove?(): void
}

export function Tag(props: TagProps) {
  const { type, style, children, icon, height, removable, onRemove, ...rest } = props
  const { classes, css } = useStyles((theme) => createStyles(height, theme))
  const locale = useLocale()

  return (
    <span className={css(classes.tag, classes[type], style)} {...rest}>
      {icon && <Icon icon={icon} style={classes.icon} />}
      {children}
      {removable && (
        <button
          type='button'
          className={classes.removeButton}
          aria-label={locale.tag.remove}
          onClick={onRemove}
          data-testid='remove-tag-button'
        >
          <Icon icon='timesDefault' style={classes.removeIcon} />
        </button>
      )}
    </span>
  )
}

Tag.defaultProps = {
  height: '1.5rem',
  type: 'normal',
  onRemove: () => null,
} as Partial<TagProps>

const createStyles = (height: String, theme: Theme) => ({
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    fontWeight: 'bold',
    borderRadius: theme.radius.tag,
    whiteSpace: 'nowrap',
    lineHeight: '1rem',
    fontSize: theme.typography.sizes.text,
    height: height,
  } as CSSProperties,
  icon: {
    fontSize: '1rem',
    marginRight: '0.25rem',
  } as CSSProperties,
  removeButton: {
    // Without the look of a button, so the tag looks as it did when the icon took the click
    display: 'inline-flex',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: theme.radius.button,
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      color: theme.pallete.status.danger.main,
    },
    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme, 'primary', 'single'),
    },
  } as CSSProperties,
  removeIcon: {
    fontSize: '1rem',
    marginLeft: '0.125rem',
  } as CSSProperties,
  normal: {
    background: theme.pallete.gray.c80,
  } as CSSProperties,
  danger: {
    background: theme.pallete.status.danger.main,
    color: theme.pallete.status.danger.onColor,
  } as CSSProperties,
  info: {
    background: theme.pallete.status.info.main,
    color: theme.pallete.status.info.onColor,
  } as CSSProperties,
  success: {
    background: theme.pallete.status.success.main,
    color: theme.pallete.status.success.onColor,
  } as CSSProperties,
  alert: {
    background: theme.pallete.status.alert.main,
    color: theme.pallete.status.alert.onColor,
  } as CSSProperties,
})
