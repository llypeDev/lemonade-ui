import React, { CSSProperties } from 'react'

import { useLocale } from '../../../i18n'
import { Theme, useStyles } from '../../../styles'
import { Spinner } from '../../Spinner'
import { TableCell, TableRow } from '../Table'

export interface TableLoadingRowProps {
  colSpan: number

  /**
   * @default "Loading results", from the locale strings
   */
  message?: string

  /**
   * Shows the message over the rows below it, at the top of the body, in a row that takes no height, so the rows
   * that are there while new ones load keep their place
   */
  overlay?: boolean
}

export function TableLoadingRow(props: TableLoadingRowProps) {
  const { colSpan, message, overlay } = props
  const { classes, css } = useStyles(createStyles)
  const locale = useLocale()

  return (
    <TableRow>
      <TableCell colSpan={colSpan} style={overlay ? classes.overlayCell : classes.cell}>
        <div className={overlay ? css(classes.container, classes.overlay) : classes.container}>
          <Spinner />
          {message ?? locale.dataTable.loading}
        </div>
      </TableCell>
    </TableRow>
  )
}

const createStyles = (theme: Theme) => ({
  cell: {
    background: theme.pallete.surface.background,
    color: theme.pallete.primary.main,
    fontWeight: 'bold',
  } as CSSProperties,
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *:first-of-type': {
      marginRight: '0.5rem',
    },
  } as CSSProperties,
  // The cell spans the table, and has no height, padding or border, so the row adds nothing to the height of the
  // table. It is the box the message is placed in.
  overlayCell: {
    position: 'relative',
    height: 0,
    padding: 0,
    border: 0,
    color: theme.pallete.primary.main,
    fontWeight: 'bold',
  } as CSSProperties,
  // On the middle of the first row, over the rows, which are dimmed while loading
  overlay: {
    position: 'absolute',
    top: '1.25rem',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
    padding: '0.25rem 0.75rem',
    whiteSpace: 'nowrap',
    background: theme.pallete.surface.main,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    boxShadow: theme.shadows.outer[10],
  } as CSSProperties,
})
