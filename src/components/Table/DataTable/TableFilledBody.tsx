import React, { CSSProperties } from 'react'

import { Theme, useStyles } from '../../../styles'
import { TableBody, TableCell, TableRow } from '../Table'

import { DataTableProps, defaultColumnStyles } from './DataTable'
import { TableLoadingRow } from './TableLoadingRow'
import { TablePlaceholderRow } from './TablePlaceholderRow'

export interface TableFilledBodyProps extends Pick<DataTableProps, 'columns' | 'rows' | 'loading' | 'onRowClick'> {
  /**
   * Highlights the selected rows
   */
  isRowSelected?(row: any): boolean
}

export function TableFilledBody(props: TableFilledBodyProps) {
  const { columns, rows, loading, onRowClick, isRowSelected } = props
  const { classes, css } = useStyles(createStyles)

  const handleClick = (row) => (e) => onRowClick(row)

  const isEmpty = () => !rows || rows.length === 0

  return (
    <TableBody>
      {loading && <TableLoadingRow colSpan={columns.length} />}

      {!loading && isEmpty() && <TablePlaceholderRow colSpan={columns.length} />}

      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          onClick={onRowClick && handleClick(row)}
          style={isRowSelected && isRowSelected(row) && classes.selected}
        >
          {columns.map((col, colIdx) => (
            <TableCell key={colIdx} style={css(defaultColumnStyles(col), col.style)}>
              {col.render(row)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

const createStyles = (theme: Theme) => ({
  selected: {
    // Stronger than the hover of the table, so a selected row keeps its color under the pointer
    '&& td': {
      background: theme.pallete.primary.c90,
    },
    '&&:hover td': {
      background: theme.pallete.primary.c80,
    },
  } as CSSProperties,
})
