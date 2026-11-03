import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'

import { SortDirection } from '../SortableLabel/SortableLabel'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './index'

export default {
  title: 'Components/Table',
  component: Table,
}

export const _Table = (args) => {
  // The story keeps the direction of the sortable header, as the parent of a table does
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC')

  const handleSortChange = (direction: SortDirection, shiftKey?: boolean) => {
    setSortDirection(direction)
    action('sort-changed')(direction, shiftKey)
  }

  return (
    <Table hovered={args.hovered}>
      <TableHead>
        <TableRow>
          <TableHeader sortable={true} sortDirection={sortDirection} onSortChange={handleSortChange}>
            Header #1
          </TableHeader>
          <TableHeader>Header #2</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={2}>Row #1</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Row #2 - Cell #1</TableCell>
          <TableCell>Row #2 - Cell #2</TableCell>
        </TableRow>
        <TableRow onClick={action('row-click')}>
          <TableCell>Row #3 - Cell #1</TableCell>
          <TableCell>Row #3 - Cell #2</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
