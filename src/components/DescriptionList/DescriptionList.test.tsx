import { render } from '@testing-library/react'
import React from 'react'

import { DescriptionList } from './DescriptionList'

const items = [
  { term: 'Name', description: 'Ana Souza' },
  { term: 'Email', description: 'ana@example.com' },
  { term: 'Role', description: 'Product designer' },
]

describe('DescriptionList', () => {
  it('should render correctly', () => {
    const { container } = render(<DescriptionList items={items} />)
    expect(container).toMatchSnapshot()
  })

  it('should render a vertical divided list correctly', () => {
    const { container } = render(<DescriptionList items={items} layout='vertical' columns={3} divided />)
    expect(container).toMatchSnapshot()
  })

  it('should pair each term with its description in a definition list', () => {
    const { container } = render(<DescriptionList items={items} />)
    const list = container.querySelector('dl')
    const terms = list.querySelectorAll('dt')
    const descriptions = list.querySelectorAll('dd')

    expect(terms).toHaveLength(3)
    expect(descriptions).toHaveLength(3)
    expect(terms[1]).toHaveTextContent('Email')
    expect(terms[1].nextElementSibling).toBe(descriptions[1])
    expect(descriptions[1]).toHaveTextContent('ana@example.com')
  })

  it('should accept elements as terms and descriptions', () => {
    const { getByRole } = render(
      <DescriptionList items={[{ key: 'site', term: <span>Site</span>, description: <a href='/'>example.com</a> }]} />
    )
    expect(getByRole('link', { name: 'example.com' })).toBeInTheDocument()
  })

  it('should pass other props to the list', () => {
    const { container } = render(<DescriptionList items={items} aria-label='Profile' data-testid='profile' />)
    expect(container.querySelector('dl')).toHaveAttribute('aria-label', 'Profile')
  })
})
