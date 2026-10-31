import React, { CSSProperties } from 'react'

import { useLocale } from '../../../i18n'
import { Theme, useStyles } from '../../../styles'
import { TableCell, TableRow } from '../Table'

export interface TablePlaceholderRowProps {
  colSpan: number

  /**
   * @default "No results found", from the locale strings
   */
  message?: string
}

export function TablePlaceholderRow(props: TablePlaceholderRowProps) {
  const { colSpan, message } = props
  const { classes } = useStyles(createStyles)
  const locale = useLocale()

  return (
    <TableRow>
      <TableCell colSpan={colSpan} style={classes.cell}>
        {message ?? locale.dataTable.empty}
      </TableCell>
    </TableRow>
  )
}

export const createStyles = (theme: Theme) => ({
  cell: {
    color: theme.pallete.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  } as CSSProperties,
})
