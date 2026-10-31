import React, { CSSProperties, useMemo } from 'react'

import { Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'

export interface DropdownGroupProps {
  /**
   * Title of the group, shown above its items and read by screen readers
   */
  label: React.ReactNode

  children?: React.ReactNode
}

/**
 * Items of a `Dropdown` under a title, such as "Sort by"
 */
export function DropdownGroup(props: DropdownGroupProps) {
  const { label, children } = props
  const { classes } = useStyles(createStyles)
  const labelId = useMemo(() => `dropdown-group-${randomStr()}`, [])

  return (
    <li role='none' className={classes.root}>
      <span id={labelId} className={classes.label}>
        {label}
      </span>
      <ul role='group' aria-labelledby={labelId} className={classes.list}>
        {children}
      </ul>
    </li>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    listStyle: 'none',
    '& + &': {
      marginTop: '0.5rem',
    },
  } as CSSProperties,
  label: {
    display: 'block',
    padding: '0.25rem 1rem',
    color: theme.pallete.text.secondary,
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  } as CSSProperties,
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as CSSProperties,
})
