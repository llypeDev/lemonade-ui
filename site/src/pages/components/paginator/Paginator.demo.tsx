import { Paginator } from '@lemonade/ui'
import React, { useState } from 'react'

function PaginatorEx() {
  const [page, setPage] = useState(4)

  return <Paginator page={page} total={20} onChange={setPage} />
}

export default PaginatorEx
