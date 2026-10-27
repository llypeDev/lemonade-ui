import React, { CSSProperties } from 'react'

import { ExternalStyles, focusBoxShadow, hexToRGB, Theme, useStyles } from '../../styles'
import { Icon } from '../Icon'

export type ExpandableHeadingLevel = 2 | 3 | 4 | 5 | 6

export interface ExpandableHeaderProps {
  id: string
  contentId: string
  expanded: boolean
  disabled?: boolean
  headingLevel: ExpandableHeadingLevel
  onClick(): void
  children: React.ReactNode
  style?: ExternalStyles
}

/**
 * Header shared by `AccordionItem` and `ExpandableCard`: a button inside a heading that shows or hides its content.
 */
export function ExpandableHeader(props: ExpandableHeaderProps) {
  const { id, contentId, expanded, disabled, headingLevel, onClick, children, style } = props
  const { classes, css } = useStyles(createStyles)

  const Heading = `h${headingLevel}` as React.ElementType

  return (
    <Heading className={classes.heading}>
      <button
        type='button'
        id={id}
        className={css(classes.button, style)}
        aria-expanded={expanded}
        aria-controls={contentId}
        disabled={disabled}
        data-expandable-header
        onClick={onClick}
      >
        <Icon icon='angleDown' size={1.5} style={css(classes.icon, !expanded && classes.iconCollapsed)} />
        <span className={classes.title}>{children}</span>
      </button>
    </Heading>
  )
}

const createStyles = (theme: Theme) => ({
  heading: {
    margin: 0,
    fontSize: 'inherit',
  } as CSSProperties,
  button: {
    ...theme.typography.variant('main'),
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 0,
    borderRadius: `${theme.radius.popper}px`,
    background: 'transparent',
    color: theme.pallete.text.main,
    fontWeight: 'bold',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background .2s',
    ':not(:disabled):hover': {
      background: hexToRGB(theme.pallete.gray.c50, 0.1),
    },
    ':focus': {
      outline: 'none',
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
    ':disabled': {
      color: theme.pallete.text.disabled,
      cursor: 'not-allowed',
    },
  } as CSSProperties,
  icon: {
    flexShrink: 0,
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  iconCollapsed: {
    transform: 'rotate(-90deg)',
  } as CSSProperties,
  title: {
    flex: 1,
  } as CSSProperties,
})
