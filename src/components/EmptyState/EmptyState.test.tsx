import { render } from '@testing-library/react'
import React from 'react'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('should render correctly', () => {
    const { container } = render(
      <EmptyState
        icon='zoomOutline'
        title='No orders found'
        description='Try other filters.'
        actions={<button>Clear filters</button>}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should show the title as a heading of the given level', () => {
    const { getByRole } = render(<EmptyState title='No orders found' headingLevel={2} />)
    expect(getByRole('heading', { name: 'No orders found' }).tagName).toBe('H2')
  })

  it('should use a level 3 heading by default', () => {
    const { getByRole } = render(<EmptyState title='No orders found' />)
    expect(getByRole('heading').tagName).toBe('H3')
  })

  it('should show the description and the actions', () => {
    const { getByText, getByRole } = render(
      <EmptyState title='Empty' description='Nothing here yet.' actions={<button>Create</button>} />
    )

    expect(getByText('Nothing here yet.')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should show the image in place of the icon', () => {
    const { container, getByAltText } = render(
      <EmptyState title='Empty' icon='zoomOutline' image={<img src='empty.svg' alt='Empty box' />} />
    )

    expect(getByAltText('Empty box')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })
})
