import { render } from '@testing-library/react'
import React from 'react'

import { Divider } from './Divider'

describe('Divider', () => {
  it('should render correctly', () => {
    const { container } = render(<Divider />)
    expect(container).toMatchSnapshot()
  })

  it('should be a horizontal rule by default', () => {
    const { getByRole } = render(<Divider />)
    expect(getByRole('separator').tagName).toBe('HR')
  })

  it('should set the vertical orientation', () => {
    const { getByRole } = render(<Divider orientation='vertical' />)
    expect(getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('should show and name a label', () => {
    const { getByRole, getByText } = render(<Divider label='or' />)

    expect(getByText('or')).toBeInTheDocument()
    expect(getByRole('separator')).toHaveAttribute('aria-label', 'or')
  })

  it('should apply the spacing', () => {
    const { getByRole } = render(<Divider spacing={2} />)
    expect(getByRole('separator')).toHaveStyle({ margin: '2rem 0' })
  })
})
