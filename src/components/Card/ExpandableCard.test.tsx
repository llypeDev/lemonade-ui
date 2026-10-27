import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Button } from '../Button'

import { ExpandableCard } from './ExpandableCard'

jest.mock('../../util/string')

it('should render correctly', () => {
  const { container } = render(<ExpandableCard title='Title'>Content</ExpandableCard>)
  expect(container).toMatchSnapshot()
})

it('should expand and collapse when the header is clicked', () => {
  const onChange = jest.fn()
  const { getByRole, getByText } = render(
    <ExpandableCard title='Details' onChange={onChange}>
      Content
    </ExpandableCard>
  )
  const header = getByRole('button', { name: 'Details' })

  expect(header).toHaveAttribute('aria-expanded', 'false')
  expect(getByText('Content')).not.toBeVisible()

  fireEvent.click(header)
  expect(header).toHaveAttribute('aria-expanded', 'true')
  expect(getByText('Content')).toBeVisible()
  expect(onChange).toHaveBeenCalledWith(true)
})

it('should keep clicks on content buttons inside the content', () => {
  const onClick = jest.fn()
  const { getByRole } = render(
    <ExpandableCard title='Details' defaultExpanded>
      <Button onClick={onClick}>Call to action</Button>
    </ExpandableCard>
  )

  fireEvent.click(getByRole('button', { name: 'Call to action' }))
  expect(onClick).toHaveBeenCalledTimes(1)
  expect(getByRole('button', { name: 'Details' })).toHaveAttribute('aria-expanded', 'true')
})

it('should link the header to its content', () => {
  const { getByRole, getByText } = render(
    <ExpandableCard title='Details' defaultExpanded>
      Content
    </ExpandableCard>
  )
  const header = getByRole('button', { name: 'Details' })
  const content = getByText('Content')

  expect(header).toHaveAttribute('aria-controls', content.id)
  expect(content).toHaveAttribute('aria-labelledby', header.id)
})

it('should not toggle when disabled', () => {
  const { getByRole, getByText } = render(
    <ExpandableCard title='Details' disabled>
      Content
    </ExpandableCard>
  )

  fireEvent.click(getByRole('button', { name: 'Details' }))
  expect(getByText('Content')).not.toBeVisible()
})
