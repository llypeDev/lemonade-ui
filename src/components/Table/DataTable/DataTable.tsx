import React, { CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useLocale } from '../../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useCss, useStyles } from '../../../styles'
import { randomStr } from '../../../util/string'
import { Button } from '../../Button'
import { Checkbox } from '../../Checkbox'
import { Icon } from '../../Icon'
import { VisuallyHidden } from '../../VisuallyHidden'
import { SortDirection } from '../SortableLabel/SortableLabel'
import { Table, TableHead, TableHeader, TableHeaderProps, TableProps, TableRow } from '../Table'

import { TableFilledBody } from './TableFilledBody'

export type DataTableRowId = string | number

export interface TableColumnConfig<T = any> {
  name: string
  header?: React.ReactNode
  sortable?: boolean
  style?: ExternalStyles
  align?: 'left' | 'center' | 'right'
  render(row: T): React.ReactNode
}

export interface DataTableProps<T = any> extends TableProps {
  rows: ReadonlyArray<T>
  columns: Array<TableColumnConfig<T>>
  loading?: boolean
  sort?: ReadonlyArray<string>
  onSortChange?(sort: string[]): void
  render?(renderProps: DataTableRenderProps): React.ReactNode
  onRowClick?(row: T): any

  /**
   * Ids of the selected rows. With `onSelectedRowsChange`, a checkbox at the start of each row selects it, and
   * one in the header selects all the rows on the screen.
   */
  selectedRows?: ReadonlyArray<DataTableRowId>

  /**
   * Called with the ids of the selected rows when the user selects or unselects rows. Turns the selection on.
   */
  onSelectedRowsChange?(selectedRows: DataTableRowId[]): void

  /**
   * Id of a row, for the selection
   * @default the `id` of the row
   */
  getRowId?(row: T): DataTableRowId

  /**
   * Text that names the checkbox of a row for screen readers, such as the name of a person
   * @default "row 3", from the locale strings
   */
  getRowLabel?(row: T): string

  /**
   * Actions for the selected rows, such as "Export" or "Delete". They show in a bar above the table while rows
   * are selected, with the number of selected rows and a button to clear the selection.
   */
  bulkActions?(selectedRows: T[], selectedIds: DataTableRowId[]): React.ReactNode

  /**
   * Keeps the header at the top while the rows scroll. Put the table in a container with a height and
   * `overflow: auto`.
   */
  stickyHeader?: boolean

  /**
   * Details of a row, shown below it. With it, a button at the start of each row shows and hides them.
   */
  renderExpanded?(row: T): React.ReactNode

  /**
   * Ids of the rows with their details shown, for controlled rows
   */
  expandedRows?: ReadonlyArray<DataTableRowId>

  /**
   * Ids of the rows that start with their details shown
   * @default []
   */
  defaultExpandedRows?: ReadonlyArray<DataTableRowId>

  /**
   * Called with the ids of the rows with their details shown when the user shows or hides details
   */
  onExpandedRowsChange?(expandedRows: DataTableRowId[]): void

  /**
   * Names of the columns that are not shown, such as the ones the user hid with a `DataTableColumnsMenu`
   */
  hiddenColumns?: ReadonlyArray<string>
}

export interface DataTableRenderProps extends DataTableProps {
  getHeaderProps(column: TableColumnConfig | string): TableHeaderProps
  getColumn(columnName: string): TableColumnConfig
  isRowSelected(row: any): boolean
  isRowExpanded(row: any): boolean
  getDetailsId(row: any): string
}

const selectionColumnName = '__selection'
const expandColumnName = '__expand'

const defaultGetRowId = (row: any): DataTableRowId => row.id

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

export function DataTable<T = any>(props: DataTableProps<T>) {
  const {
    rows,
    selectedRows,
    onSelectedRowsChange,
    getRowId = defaultGetRowId,
    getRowLabel,
    bulkActions,
    renderExpanded,
    expandedRows,
    defaultExpandedRows = [],
    onExpandedRowsChange,
    hiddenColumns,
  } = props
  const { css } = useCss()
  const { classes } = useStyles(createStyles)
  const tableId = useMemo(() => `data-table-${randomStr()}`, [])
  const [internalExpanded, setInternalExpanded] = useState<ReadonlyArray<DataTableRowId>>(defaultExpandedRows)
  const expanded = expandedRows ?? internalExpanded
  const isRowExpanded = (row: T) => !!renderExpanded && expanded.includes(getRowId(row))
  const getDetailsId = (row: T) => `${tableId}-details-${String(getRowId(row)).replace(/[^\w-]/g, '_')}`

  const toggleExpanded = (row: T) => {
    const id = getRowId(row)
    const next = expanded.includes(id) ? expanded.filter((other) => other !== id) : [...expanded, id]
    if (expandedRows === undefined) {
      setInternalExpanded(next)
    }
    onExpandedRowsChange && onExpandedRowsChange(next)
  }
  const locale = useLocale()
  const selectAllRef = useRef<HTMLInputElement>(null)
  // Whether the focus is in the bar of bulk actions, which goes away when nothing is selected
  const focusInBar = useRef(false)

  const selectable = !!onSelectedRowsChange
  const selected = selectedRows || []
  const isRowSelected = (row: T) => selectable && selected.includes(getRowId(row))

  const pageIds = (rows || []).map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selected.includes(id))
  const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length

  // Selecting all keeps the rows of other pages that were selected before
  const toggleAll = () =>
    onSelectedRowsChange(
      allSelected
        ? selected.filter((id) => !pageIds.includes(id))
        : [...selected, ...pageIds.filter((id) => !selected.includes(id))]
    )

  const toggleRow = (row: T) => {
    const id = getRowId(row)
    onSelectedRowsChange(selected.includes(id) ? selected.filter((other) => other !== id) : [...selected, id])
  }

  const rowLabel = (row: T) =>
    getRowLabel ? getRowLabel(row) : fill(locale.dataTable.row, { index: rows.indexOf(row) + 1 })

  // The checkbox does not trigger onRowClick
  const stopClick = (e: React.MouseEvent) => e.stopPropagation()

  const selectionColumn: TableColumnConfig<T> = {
    name: selectionColumnName,
    header: (
      <Checkbox
        inputRef={selectAllRef}
        aria-label={locale.dataTable.selectAll}
        checked={allSelected}
        indeterminate={selectedOnPage.length > 0 && !allSelected}
        disabled={pageIds.length === 0}
        onChange={toggleAll}
      />
    ),
    style: classes.selectionColumn,
    render: (row) => (
      <span className={classes.checkbox} onClick={stopClick}>
        <Checkbox
          aria-label={fill(locale.dataTable.selectRow, { row: rowLabel(row) })}
          checked={selected.includes(getRowId(row))}
          onChange={() => toggleRow(row)}
        />
      </span>
    ),
  }

  const expandColumn: TableColumnConfig<T> = {
    name: expandColumnName,
    style: classes.expandColumn,
    render: (row) => {
      const open = isRowExpanded(row)
      return (
        <button
          type='button'
          className={classes.expandButton}
          aria-expanded={open}
          aria-controls={open ? getDetailsId(row) : undefined}
          aria-label={fill(open ? locale.dataTable.collapse : locale.dataTable.expand, { row: rowLabel(row) })}
          onClick={(e) => {
            // Showing the details does not trigger onRowClick
            e.stopPropagation()
            toggleExpanded(row)
          }}
        >
          <Icon icon='angleRight' size={1.25} style={open ? classes.chevronOpen : classes.chevron} />
        </button>
      )
    },
  }

  const visibleColumns = hiddenColumns
    ? props.columns.filter((col) => !hiddenColumns.includes(col.name))
    : props.columns
  const columns = [
    ...(selectable ? [selectionColumn] : []),
    ...(renderExpanded ? [expandColumn] : []),
    ...visibleColumns,
  ]

  const getColumn = (columnName: string): TableColumnConfig => {
    return columns.find((col) => col.name === columnName)
  }

  const getHeaderProps = (column: TableColumnConfig | string): TableHeaderProps & { key; 'data-name' } => {
    const col = typeof column === 'string' ? getColumn(column) : column

    if (!col) {
      throw new Error(`Column '${column}' not found.`)
    }

    const { name, sortable, style } = col

    return {
      key: name,
      'data-name': name,
      sortable,
      sortDirection: getSortDirection(col),
      onSortChange: handleSortChange(col),
      style: css(defaultColumnStyles(col), style),
    }
  }

  const handleSortChange = (col: TableColumnConfig) => (sortDirection: SortDirection, shiftKey: boolean) => {
    if (shiftKey) {
      props.onSortChange(changeSort(props.sort, col.name, sortDirection))
    } else {
      props.onSortChange([sortDirection === 'ASC' ? col.name : `-${col.name}`])
    }
  }

  const getSortDirection = (col: TableColumnConfig): SortDirection => {
    const sorts = props.sort || []
    const name = col.name
    for (const sort of sorts) {
      if (sort === name) {
        return 'ASC'
      } else if (sort === `-${name}`) {
        return 'DESC'
      }
    }
    return null
  }

  const count = selected.length
  const countText = count === 1 ? locale.dataTable.selectedOne : fill(locale.dataTable.selectedOther, { count: count })

  // An action that clears the selection, such as "Delete", removes the bar with the focus in it, so the focus
  // goes to the checkbox that selects all
  useLayoutEffect(() => {
    if (count === 0 && focusInBar.current) {
      focusInBar.current = false
      const lost = !document.activeElement || document.activeElement === document.body
      const checkbox = selectAllRef.current
      lost && checkbox && !checkbox.disabled && checkbox.focus()
    }
  }, [count])

  const handleBarBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Without a next element, the focus was lost because the bar went away
    if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) {
      focusInBar.current = false
    }
  }

  // Clearing removes the bar, so the focus goes to the checkbox that selects all
  const clearSelection = () => {
    onSelectedRowsChange([])
    selectAllRef.current && selectAllRef.current.focus()
  }

  return (
    <>
      {selectable && bulkActions && count > 0 && (
        <div
          role='region'
          aria-label={locale.dataTable.bulkActions}
          className={classes.bar}
          onFocus={() => (focusInBar.current = true)}
          onBlur={handleBarBlur}
        >
          <span className={classes.count}>{countText}</span>
          <div className={classes.actions}>
            {bulkActions(
              rows.filter((row) => selected.includes(getRowId(row))),
              [...selected]
            )}
          </div>
          <Button size='small' skin='ghost' onClick={clearSelection}>
            {locale.dataTable.clearSelection}
          </Button>
        </div>
      )}
      {selectable && <VisuallyHidden role='status'>{count > 0 ? countText : ''}</VisuallyHidden>}
      {props.render({
        ...props,
        columns,
        getHeaderProps,
        getColumn,
        isRowSelected,
        isRowExpanded,
        getDetailsId,
      })}
    </>
  )
}

DataTable.defaultProps = {
  loading: false,
  sort: null,
  onSortChange: () => null,
  render: (renderProps: DataTableRenderProps) => <DataTableDefault {...renderProps} />,
  onRowClick: null,
  hovered: true,
} as Partial<DataTableProps<any>>

export function DataTableDefault(props: DataTableRenderProps) {
  const {
    columns,
    rows,
    loading,
    onSortChange,
    sort,
    getHeaderProps,
    getColumn,
    render,
    onRowClick,
    selectedRows,
    onSelectedRowsChange,
    getRowId,
    getRowLabel,
    bulkActions,
    isRowSelected,
    stickyHeader,
    renderExpanded,
    expandedRows,
    defaultExpandedRows,
    onExpandedRowsChange,
    hiddenColumns,
    isRowExpanded,
    getDetailsId,
    ...rest
  } = props
  const { css } = useCss()
  const { classes } = useStyles(createStyles)

  return (
    <Table {...rest}>
      <TableHead>
        <TableRow>
          {columns.map((col) => {
            const headerProps = getHeaderProps(col)
            return (
              <TableHeader
                key={col.name}
                {...headerProps}
                style={stickyHeader ? css(headerProps.style, classes.sticky) : headerProps.style}
              >
                {col.header}
              </TableHeader>
            )
          })}
        </TableRow>
      </TableHead>
      <TableFilledBody
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={onRowClick}
        isRowSelected={isRowSelected}
        renderExpanded={renderExpanded}
        isRowExpanded={isRowExpanded}
        getDetailsId={getDetailsId}
      />
    </Table>
  )
}

const changeSort = (sort: ReadonlyArray<string>, name: string, dir: SortDirection): string[] => {
  const newSort = dir === 'ASC' ? name : `-${name}`
  let swap = false
  const newArray = sort.map((s) => {
    if (s === name || s === `-${name}`) {
      swap = true
      return newSort
    }
    return s
  })
  return swap ? newArray : [...newArray, newSort]
}

export const defaultColumnStyles = (col: TableColumnConfig) => ({
  textAlign: col.align,
})

const createStyles = (theme: Theme) => ({
  selectionColumn: {
    width: '1%',
    paddingRight: 0,
    lineHeight: 0,
  } as CSSProperties,
  checkbox: {
    display: 'inline-flex',
  } as CSSProperties,
  expandColumn: {
    width: '1%',
    paddingRight: 0,
    lineHeight: 0,
  } as CSSProperties,
  expandButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: theme.radius.button,
    background: 'transparent',
    color: theme.pallete.text.main,
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      background: theme.pallete.surface.background,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  chevron: {
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  chevronOpen: {
    transform: 'rotate(90deg)',
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    background: theme.pallete.surface.main,
    // The border of a collapsed table does not stick, so a shadow draws the line under the header
    boxShadow: `inset 0 -1px 0 ${theme.pallete.divider}`,
  } as CSSProperties,
  bar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem 1rem',
    marginBottom: '0.5rem',
    padding: '0.5rem 0.5rem 0.5rem 1rem',
    border: `1px solid ${theme.pallete.primary.c80}`,
    borderRadius: theme.radius.paper,
    background: theme.pallete.primary.c90,
    color: theme.pallete.primary.c30,
  } as CSSProperties,
  count: {
    fontWeight: 'bold',
  } as CSSProperties,
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
  } as CSSProperties,
})
