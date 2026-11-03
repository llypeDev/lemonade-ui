import { action } from '@storybook/addon-actions'
import React, { useEffect, useState } from 'react'

import { Paginator } from './Paginator'

export default {
  title: 'Components/Paginator',
  component: Paginator,
  args: { page: 4, total: 20, onChange: action('page-changed') },
}

export const Default = (args) => {
  // The story keeps the page, as the parent of a paginator does. The control of the page still sets it.
  const [page, setPage] = useState(args.page)
  useEffect(() => setPage(args.page), [args.page])

  const handleChange = (newPage: number) => {
    setPage(newPage)
    args.onChange(newPage)
  }

  return <Paginator {...args} page={page} onChange={handleChange} />
}
