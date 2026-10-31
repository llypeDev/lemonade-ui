import React, { useState } from 'react'

import { useLocale } from '../../../i18n'
import { Button } from '../../Button'
import { Dropdown, DropdownCheckboxItem } from '../../Dropdown'
import { Icon } from '../../Icon'

import { TableColumnConfig } from './DataTable'

export interface DataTableColumnsMenuProps {
  /**
   * The columns of the table
   */
  columns: Array<TableColumnConfig<any>>

  /**
   * Names of the hidden columns, given to the `hiddenColumns` of the `DataTable`
   */
  hiddenColumns: ReadonlyArray<string>

  /**
   * Called with the names of the hidden columns when the user shows or hides a column
   */
  onHiddenColumnsChange(hiddenColumns: string[]): void

  /**
   * @default "Columns", from the locale strings
   */
  label?: React.ReactNode
}

/**
 * A button that opens a menu to show and hide the columns of a `DataTable`. The last visible column cannot be
 * hidden.
 */
export function DataTableColumnsMenu(props: DataTableColumnsMenuProps) {
  const { columns, hiddenColumns, onHiddenColumnsChange, label } = props
  const locale = useLocale()
  const [anchor, setAnchor] = useState<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const visibleCount = columns.filter((col) => !hiddenColumns.includes(col.name)).length

  const toggle = (name: string) =>
    onHiddenColumnsChange(
      hiddenColumns.includes(name) ? hiddenColumns.filter((other) => other !== name) : [...hiddenColumns, name]
    )

  return (
    <>
      <Button innerRef={setAnchor} size='small' skin='outline' onClick={() => setOpen(!open)}>
        <Icon icon='angleDown' size={1} style={{ marginRight: '0.25rem' }} />
        {label ?? locale.dataTable.columns}
      </Button>
      <Dropdown anchorRef={anchor} open={open} onClose={() => setOpen(false)} popperProps={{ placement: 'bottom-end' }}>
        {columns.map((col) => {
          const visible = !hiddenColumns.includes(col.name)
          return (
            <DropdownCheckboxItem
              key={col.name}
              checked={visible}
              disabled={visible && visibleCount === 1}
              onCheckedChange={() => toggle(col.name)}
            >
              {typeof col.header === 'string' ? col.header : col.name}
            </DropdownCheckboxItem>
          )
        })}
      </Dropdown>
    </>
  )
}
