import React, { CSSProperties, useContext, useState } from 'react'

import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Icon, IconImage } from '../Icon'

import { ChipGroupContext } from './ChipGroup'

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'value'> {
  /**
   * Whether the chip is on, for a controlled chip outside a `ChipGroup`
   */
  selected?: boolean

  /**
   * Whether an uncontrolled chip outside a `ChipGroup` starts on
   * @default false
   */
  defaultSelected?: boolean

  /**
   * Called when the user turns the chip on or off, outside a `ChipGroup`
   */
  onSelectedChange?(selected: boolean): void

  /**
   * Value of the chip inside a `ChipGroup`
   */
  value?: string

  /**
   * Icon before the label. A selected chip shows a check instead.
   */
  icon?: IconImage

  /**
   * Number after the label, such as the results the filter leaves
   */
  count?: number

  children?: React.ReactNode
  style?: ExternalStyles
}

/**
 * A compact option that turns on and off, such as a filter. Put related chips in a `ChipGroup`.
 */
export function Chip(props: ChipProps) {
  const {
    selected,
    defaultSelected = false,
    onSelectedChange,
    value,
    icon,
    count,
    onClick,
    children,
    style,
    ...rest
  } = props

  const group = useContext(ChipGroupContext)
  const { classes, css } = useStyles(createStyles)
  const [internalSelected, setInternalSelected] = useState(defaultSelected)

  const inGroup = group && value !== undefined
  const isSelected = inGroup ? group.isSelected(value) : selected ?? internalSelected

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick && onClick(e)

    if (e.defaultPrevented) {
      return
    }

    if (inGroup) {
      group.toggle(value)
      return
    }

    if (selected === undefined) {
      setInternalSelected(!isSelected)
    }
    onSelectedChange && onSelectedChange(!isSelected)
  }

  const shownIcon = isSelected ? 'checkDefault' : icon

  return (
    <button
      type='button'
      aria-pressed={isSelected}
      className={css(classes.chip, isSelected && classes.selected, style)}
      onClick={handleClick}
      {...rest}
    >
      {shownIcon && <Icon icon={shownIcon} size={1} aria-hidden='true' />}
      <span>{children}</span>
      {typeof count === 'number' && <span className={classes.count}>{count}</span>}
    </button>
  )
}

const createStyles = (theme: Theme) => ({
  chip: {
    ...theme.typography.variant('main'),
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    boxSizing: 'border-box',
    height: '2rem',
    margin: 0,
    padding: '0 0.75rem',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: '1rem',
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background .2s, border-color .2s, box-shadow .2s',
    '&:not(:disabled):hover': {
      borderColor: theme.pallete.gray.c40,
      background: theme.pallete.surface.background,
    },
    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme),
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  } as CSSProperties,
  selected: {
    borderColor: theme.pallete.primary.main,
    background: theme.pallete.primary.c90,
    color: theme.pallete.primary.c30,
    fontWeight: 'bold',
    '&:not(:disabled):hover': {
      borderColor: theme.pallete.primary.c30,
      background: theme.pallete.primary.c80,
    },
  } as CSSProperties,
  count: {
    fontWeight: 'normal',
    color: theme.pallete.text.secondary,
    fontVariantNumeric: 'tabular-nums',
  } as CSSProperties,
})
