import React, { CSSProperties, HTMLAttributes } from 'react'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

import { useTabsOrientation } from './Tabs'

export interface TabItemProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  component?: React.ElementType
  active?: boolean
  disabled?: boolean
  children?: React.ReactNode
  style?: ExternalStyles
  [key: string]: any
}

export function TabItem(props: TabItemProps) {
  const { active, disabled, component, children, style, onClick, onKeyDown, ...rest } = props
  const { classes, css } = useStyles(createStyles)
  const vertical = useTabsOrientation() === 'vertical'

  const className =
    css(
      classes.item,
      active && classes.active,
      disabled && classes.disabled,
      vertical && classes.verticalItem,
      vertical && active && classes.verticalActive
    ) + `${disabled ? ' disabled' : ''}`

  const Cmp = component

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      // Also keeps a disabled link from navigating
      e.preventDefault()
      return
    }
    onClick && onClick(e)
  }

  // Buttons and links already turn the keyboard into a click; other elements, such as the default span, do not
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown && onKeyDown(e)
    const target = e.currentTarget
    const native = target.tagName === 'BUTTON' || (target.tagName === 'A' && target.hasAttribute('href'))
    if (!e.defaultPrevented && !native && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      target.click()
    }
  }

  return (
    <li role='presentation' className={css(classes.li, vertical && classes.verticalLi, style)}>
      <Cmp
        role='tab'
        className={className}
        aria-selected={!!active}
        aria-disabled={disabled || undefined}
        disabled={Cmp === 'button' ? disabled : undefined}
        {...rest}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Cmp>
    </li>
  )
}

TabItem.defaultProps = {
  component: 'span',
}

const createStyles = (theme: Theme) => ({
  li: {
    display: 'inline-block',

    '&:not(:first-child)': {
      marginLeft: '0.25rem',
    },
  } as CSSProperties,
  item: {
    display: 'inline-block',
    textDecoration: 'none',
    color: theme.pallete.text.main,
    fontWeight: 'bold',
    padding: 'calc(0.4375rem + 1px) 0.4375rem 0.4375rem 0.4375rem',
    lineHeight: '1rem',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    outline: 0,
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderBottom: `none`,
    background: theme.pallete.gray.c90,
    transition: 'background .15s, border-color .15s',

    '&:not(.disabled):hover': {
      cursor: 'pointer',
      background: theme.pallete.gray.c80,
    },

    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.pallete.primary.main}`,
    },

    // Only the keyboard shows the ring, not a click. Browsers without :focus-visible drop this rule and show it.
    // It comes before the press, which keeps its shadow.
    '&:focus:not(:focus-visible)': {
      boxShadow: 'none',
    },

    // The corners round with the ring only, so a click leaves them as they are
    '&:focus-visible': {
      borderRadius: 4,
    },

    '&:not(.disabled):active': {
      background: theme.pallete.gray.c80,
      boxShadow: theme.shadows.inner['10'],
    },
  } as CSSProperties,
  active: {
    color: theme.pallete.primary.main,
    background: theme.pallete.gray.c100,
    borderTop: `4px solid ${theme.pallete.primary.main}`,
    paddingTop: 'calc(0.4375rem - 2px)',
    position: 'relative',

    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: '-1px',
      left: '0',
      right: '0',
      height: '1px',
      background: theme.pallete.primary.c100,
    },

    '&:not(.disabled):hover': {
      background: theme.pallete.gray.c90,
    },

    '&:not(.disabled):active': {
      background: theme.pallete.gray.c90,
    },
  } as CSSProperties,
  disabled: {
    color: theme.pallete.text.disabled,

    '&:hover': {
      cursor: 'not-allowed',
    },
  } as CSSProperties,
  verticalLi: {
    display: 'block',

    '&:not(:first-child)': {
      marginLeft: 0,
      marginTop: '0.25rem',
    },
  } as CSSProperties,
  verticalItem: {
    display: 'block',
    padding: '0.4375rem 0.75rem 0.4375rem calc(0.75rem + 3px)',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRight: 'none',
    borderRadius: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  } as CSSProperties,
  verticalActive: {
    // The thick line moves to the side next to the content
    borderTop: `1px solid ${theme.pallete.gray.c60}`,
    borderLeft: `4px solid ${theme.pallete.primary.main}`,
    paddingTop: '0.4375rem',
    paddingLeft: '0.75rem',

    '&::before': {
      top: 0,
      bottom: 0,
      left: 'auto',
      right: '-1px',
      width: '1px',
      height: 'auto',
    },
  } as CSSProperties,
})
