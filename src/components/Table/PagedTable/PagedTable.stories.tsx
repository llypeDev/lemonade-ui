import { action } from '@storybook/addon-actions'
import React, { useEffect, useState } from 'react'

import { Button } from '../../Button'
import { Icon } from '../../Icon'

import { PagedTable } from './PagedTable'

interface Row {
  id: number
  name: string
  age: number
}

const rows: Row[] = [
  { id: 1, name: 'MARIA MACHADO DE JESUS', age: 42 },
  { id: 2, name: 'JOSÉ DA SILVA MOREIRA', age: 34 },
  { id: 3, name: 'ALICE BARBOSA', age: 27 },
]

export default {
  title: 'Components/Table',
  component: PagedTable,
  args: {
    empty: false,
    page: 0,
    size: 10,
    totalElements: 10,
    totalPages: 1,
    sort: ['-id', 'name'],
    sizeOptions: [10, 30, 50, 100],
    loading: false,
    onSortChange: action('sort-change'),
    onPageChange: action('page-change'),
    onSizeChange: action('size-change'),
    columns: [
      { name: 'id', header: 'ID', sortable: true, render: (row: Row) => row.id },
      { name: 'name', header: 'Name', sortable: true, render: (row: Row) => row.name },
      { name: 'age', header: 'Age', sortable: true, render: (row: Row) => row.age },
      {
        name: 'buttons',
        style: { textAlign: 'right' },
        render: (row: Row) => (
          <Button size='small' skin='ghost' aria-label={`Edit ${row.name}`}>
            <Icon icon='penOutline' />
          </Button>
        ),
      },
    ],
  },
}

export const _PagedTable = (args) => {
  // The story keeps the sort, the page and its size, as the parent of a table does. Their controls still set them.
  const [sort, setSort] = useState<string[]>(args.sort)
  const [page, setPage] = useState<number>(args.page)
  const [size, setSize] = useState<number>(args.size)
  useEffect(() => setSort(args.sort), [args.sort])
  useEffect(() => setPage(args.page), [args.page])
  useEffect(() => setSize(args.size), [args.size])

  const handleSortChange = (newSort: string[]) => {
    setSort(newSort)
    args.onSortChange(newSort)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    args.onPageChange(newPage)
  }

  const handleSizeChange = (newSize: number) => {
    setSize(newSize)
    args.onSizeChange(newSize)
  }

  return (
    <PagedTable
      {...args}
      rows={args.empty ? [] : rows}
      sort={sort}
      page={page}
      size={size}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onSizeChange={handleSizeChange}
    />
  )
}
