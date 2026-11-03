import React, { CSSProperties, useEffect, useLayoutEffect, useRef } from 'react'

import { Theme, useStyles } from '../../../styles'
import { leavingStyles } from '../../Transition/leaving'
import { TableBody, TableCell, TableRow } from '../Table'

import { DataTableProps, DataTableRowId, defaultColumnStyles } from './DataTable'
import { TableLoadingRow } from './TableLoadingRow'
import { TablePlaceholderRow } from './TablePlaceholderRow'

export interface TableFilledBodyProps extends Pick<DataTableProps, 'columns' | 'rows' | 'loading' | 'onRowClick'> {
  /**
   * Highlights the selected rows
   */
  isRowSelected?(row: any): boolean

  /**
   * Details of a row, shown in a row below it when `isRowExpanded` says so
   */
  renderExpanded?(row: any): React.ReactNode
  isRowExpanded?(row: any): boolean
  getDetailsId?(row: any): string

  /**
   * Id of a row, which keeps the state of its cells with it when rows are removed or sorted
   * @default the index of the row
   */
  getRowId?(row: any): DataTableRowId
}

// React knows `inert` as a boolean from version 19; before, it renders an unknown attribute only from a string
const inert = parseInt(React.version, 10) >= 19 ? true : ''

// A layout effect warns when it renders on a server, where it does nothing
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Browsers without `inert` still let the keyboard click an element of a row that had the focus
const blockClick = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

export function TableFilledBody(props: TableFilledBodyProps) {
  const {
    columns,
    rows,
    loading,
    onRowClick,
    isRowSelected,
    renderExpanded,
    isRowExpanded,
    getDetailsId,
    getRowId,
  } = props
  const { classes, css } = useStyles(createStyles)

  const handleClick = (row) => (e) => onRowClick(row)

  const empty = !rows || rows.length === 0

  // While new rows load, the rows that are there keep their place, dimmed and out of the reach of clicks, the
  // keyboard and screen readers, under the loading message
  const stale = loading && !empty
  const staleProps = stale ? ({ inert, onClickCapture: blockClick } as React.HTMLAttributes<HTMLElement>) : {}

  // An element of a row loses the focus when its row turns inert, so it gets it back when the rows are ready, unless
  // the user moved the focus elsewhere in the meantime
  const focused = useRef<HTMLElement>(null)
  const focusedWhenLoading = useRef<HTMLElement>(null)
  useIsomorphicLayoutEffect(() => {
    const element = focusedWhenLoading.current
    focusedWhenLoading.current = stale ? focused.current : null

    const lost = !document.activeElement || document.activeElement === document.body
    if (!stale && element && lost && document.body.contains(element)) {
      element.focus()
    }
  }, [stale])

  const rowKey = (row: any, idx: number) => {
    const id = getRowId && getRowId(row)
    return id === undefined || id === null ? `index-${idx}` : id
  }

  return (
    <TableBody
      aria-busy={loading || undefined}
      onFocus={(e) => (focused.current = e.target as HTMLElement)}
      onBlur={() => (focused.current = null)}
    >
      {loading && <TableLoadingRow colSpan={columns.length} overlay={!empty} />}

      {!loading && empty && <TablePlaceholderRow colSpan={columns.length} />}

      {(rows || []).map((row, idx) => (
        <React.Fragment key={rowKey(row, idx)}>
          <TableRow
            {...staleProps}
            onClick={onRowClick && !stale ? handleClick(row) : undefined}
            style={[isRowSelected && isRowSelected(row) && classes.selected, stale && classes.staleRow]}
          >
            {columns.map((col, colIdx) => (
              <TableCell key={colIdx} style={css(defaultColumnStyles(col), col.style)}>
                {col.render(row)}
              </TableCell>
            ))}
          </TableRow>
          {renderExpanded && isRowExpanded && isRowExpanded(row) && (
            <TableRow {...staleProps} style={[classes.detailsRow, stale && classes.staleRow]}>
              <TableCell colSpan={columns.length} id={getDetailsId && getDetailsId(row)} style={classes.details}>
                {renderExpanded(row)}
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ))}
    </TableBody>
  )
}

const createStyles = (theme: Theme) => ({
  staleRow: {
    opacity: 0.5,
    // In browsers without `inert`, clicks go through the rows and their buttons to the table
    ...leavingStyles,
  } as CSSProperties,
  detailsRow: {
    // The details belong to the row above, so the hover of the table leaves them alone
    '&& td, &&:hover td': {
      background: theme.pallete.surface.background,
    },
  } as CSSProperties,
  details: {
    height: 'auto',
    padding: '1rem 1rem 1rem 3rem',
  } as CSSProperties,
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
