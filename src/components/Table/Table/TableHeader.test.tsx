import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { SortDirection } from '../SortableLabel/SortableLabel'

import { Table, TableHead, TableHeader, TableRow } from './index'

describe('TableHeader', () => {
  it('should call onSortChange when clicked', () => {
    const sortChange = jest.fn()
    const { container } = render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader sortable={true} sortDirection='ASC' onSortChange={sortChange}>
              Header #1
            </TableHeader>
          </TableRow>
        </TableHead>
      </Table>
    )
    expect(sortChange).not.toHaveBeenCalled()
    fireEvent.click(container.querySelector('th button'))
    expect(sortChange).toHaveBeenCalledWith('DESC', false)
  })
  it('should tell the sort direction of a sortable header', () => {
    const header = (sortDirection?: SortDirection) => (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader sortable sortDirection={sortDirection}>
              Name
            </TableHeader>
            <TableHeader>Age</TableHeader>
          </TableRow>
        </TableHead>
      </Table>
    )
    const { getByRole, rerender } = render(header())
    expect(getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'none')
    expect(getByRole('columnheader', { name: 'Age' })).not.toHaveAttribute('aria-sort')

    rerender(header('ASC'))
    expect(getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending')

    rerender(header('DESC'))
    expect(getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'descending')
  })
  it('should accept the style prop', () => {
    const { container } = render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader style={{ color: 'red' }}>Test</TableHeader>
          </TableRow>
        </TableHead>
      </Table>
    )
    expect(container).toMatchSnapshot()
  })
})
