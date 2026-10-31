import React from 'react'

import { focusBoxShadow, Theme, useStyles } from '../../styles'
import { Icon, IconImage } from '../Icon'
import { Kbd } from '../Kbd'

export interface DropdownItemProps extends React.HTMLAttributes<HTMLElement> {
  type?: 'normal' | 'danger'
  disabled?: boolean
  component?: React.ElementType<any>

  /**
   * Icon before the text. `null` keeps the space of an icon, so the text lines up with items that have one.
   */
  icon?: IconImage | null

  /**
   * Keyboard shortcut of the action, shown at the end of the item, such as `['Ctrl', 'C']`. It is only shown: the
   * application handles the keys.
   */
  shortcut?: string | string[]

  [prop: string]: any
}

export function DropdownItem(props: DropdownItemProps) {
  const { type, disabled, children, onClick, component: Component, icon, shortcut, ...rest } = props
  const { classes, css } = useStyles(styles)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      // Without it, Space scrolls the page and Enter follows a link twice
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.stopPropagation() // avoid closing dropdown menu when disabled item is clicked
    } else {
      onClick && onClick(e)
    }
  }

  const hasExtras = icon !== undefined || !!shortcut
  const classNames = css(
    classes.item,
    hasExtras && classes.withExtras,
    type === 'danger' && classes.danger,
    disabled && classes.disabled
  )

  return (
    <Component
      className={classNames}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role='menuitem'
      aria-disabled={disabled ? true : undefined}
      {...rest}
    >
      {hasExtras ? (
        <>
          {icon !== undefined && (
            <span className={classes.icon} aria-hidden>
              {icon && <Icon icon={icon} size={1.25} />}
            </span>
          )}
          <span className={classes.label}>{children}</span>
          {shortcut && <Kbd keys={typeof shortcut === 'string' ? [shortcut] : shortcut} style={classes.shortcut} />}
        </>
      ) : (
        children
      )}
    </Component>
  )
}

DropdownItem.defaultProps = {
  component: 'li',
  type: 'normal',
  disabled: false,
} as Partial<DropdownItemProps>

const styles = (theme: Theme) => ({
  item: {
    ...theme.typography.variant('main'),
    margin: 0,
    textDecoration: 'none',
    cursor: 'pointer',
    padding: 'calc(0.5rem - 2px) 1rem',
    lineHeight: '1.25rem',
    fontWeight: 'bold',
    outline: 'none',
    fontSize: theme.typography.sizes.button,
    transition: 'all .2s ease',
    display: 'block',
    '&:hover': {
      background: theme.pallete.surface.background,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
      borderRadius: 4,
    },
  } as React.CSSProperties,
  withExtras: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  icon: {
    display: 'inline-flex',
    flexShrink: 0,
    width: '1.25rem',
  } as React.CSSProperties,
  label: {
    flex: 1,
  } as React.CSSProperties,
  shortcut: {
    marginLeft: '1rem',
    fontWeight: 'normal',
    // Shorter keys keep the item as tall as the others
    '& kbd': {
      lineHeight: '1rem',
    },
  } as React.CSSProperties,
  disabled: {
    color: theme.pallete.text.disabled,
    '&:hover': {
      cursor: 'not-allowed',
      background: 'transparent',
      color: theme.pallete.text.disabled,
    },
  },
  danger: {
    color: theme.pallete.status.danger.main,
    '&:hover': {
      color: theme.pallete.surface.main,
      background: theme.pallete.status.danger.main,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme, 'danger', 'inset'),
      borderRadius: 4,
    },
  },
})
