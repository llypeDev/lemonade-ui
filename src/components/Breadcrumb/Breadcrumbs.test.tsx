import { render } from '@testing-library/react'
import React from 'react'

import { Link } from '../Link'

import { Breadcrumbs } from './Breadcrumbs'

it('should render correctly', () => {
  const { container } = render(
    <Breadcrumbs>
      <Link href='/first'>Link 1</Link>
      <Link href='/first/second'>Link 2</Link>
      <Link href='/first/second/third'>Link 3</Link>
    </Breadcrumbs>
  )
  expect(container).toMatchSnapshot()
})

it('should leave out empty children', () => {
  const isAdmin = false
  const { container, getAllByRole, getByText } = render(
    <Breadcrumbs>
      <Link href='/first'>Link 1</Link>
      {null}
      <Link href='/first/second'>Link 2</Link>
      {isAdmin && <Link href='/first/second/admin'>Admin</Link>}
    </Breadcrumbs>
  )
  const items = container.querySelectorAll('li')

  expect(items).toHaveLength(3)
  expect(getAllByRole('separator', { hidden: true })).toHaveLength(1)
  // The last link is styled as the current page
  expect(items[2]).toContainElement(getByText('Link 2'))
  expect(items[2]).toHaveStyleRule('pointer-events', 'none')
  expect(items[0]).not.toHaveStyleRule('pointer-events', 'none')
})
