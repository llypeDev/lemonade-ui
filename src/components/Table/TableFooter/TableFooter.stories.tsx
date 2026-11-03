import { action } from '@storybook/addon-actions'
import React, { useEffect, useState } from 'react'

import { TableFooter } from './TableFooter'

export default {
  title: 'Components/Table',
  component: TableFooter,
  args: {
    page: 0,
    pageSize: 10,
    totalPages: 10,
    abbrev: false,
    totalElements: 1000,
    onPageChange: action('page-changed'),
    onSizeChange: action('size-changed'),
  },
}

export const _TableFooter = (args) => {
  // The story keeps the page and its size, as the parent of a table does. Their controls still set them.
  const [page, setPage] = useState<number>(args.page)
  const [pageSize, setPageSize] = useState<number>(args.pageSize)
  useEffect(() => setPage(args.page), [args.page])
  useEffect(() => setPageSize(args.pageSize), [args.pageSize])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    args.onPageChange(newPage)
  }

  const handleSizeChange = (size: number) => {
    setPageSize(size)
    args.onSizeChange(size)
  }

  return (
    <TableFooter
      {...args}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onSizeChange={handleSizeChange}
    />
  )
}
