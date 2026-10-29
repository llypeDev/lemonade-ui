import { CSSProperties } from 'react'

import { focusBoxShadow, Theme } from '../../styles'

/**
 * Styles shared by items and group headers, so both line up at every level
 */
export const createItemStyles = (theme: Theme, level: number) => ({
  item: {
    ...theme.typography.variant('main'),
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    minHeight: '2.5rem',
    margin: 0,
    // Nested labels line up with the label of their group, past its icon
    padding: `0.5rem 1rem 0.5rem ${1 + level * 2.25}rem`,
    border: 'none',
    background: 'transparent',
    color: theme.pallete.text.main,
    textAlign: 'left',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      background: theme.pallete.gray.c90,
    },
    '&:focus': {
      outline: 'none',
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
  } as CSSProperties,
  active: {
    fontWeight: 'bold',
    color: theme.pallete.primary.c40,
    background: theme.pallete.primary.c90,
    boxShadow: `inset 4px 0 0 ${theme.pallete.primary.main}`,
    '&:hover': {
      background: theme.pallete.primary.c90,
    },
  } as CSSProperties,
  icon: {
    flexShrink: 0,
  } as CSSProperties,
  label: {
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
})
