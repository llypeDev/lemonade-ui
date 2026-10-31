import { Breadcrumbs, Link } from '@lemonade/ui'
import React from 'react'

function BreadcrumbDemo() {
  return (
    <Breadcrumbs>
      <Link color='inherit' textDecoration='none' href='#home'>
        First level
      </Link>
      <Link color='inherit' textDecoration='none' href='#orders'>
        Second level
      </Link>
      <Link color='inherit' textDecoration='none' href='#order-1042'>
        Third level
      </Link>
      <Link color='inherit' textDecoration='none' href='#items'>
        Fourth level
      </Link>
    </Breadcrumbs>
  )
}

export default BreadcrumbDemo
