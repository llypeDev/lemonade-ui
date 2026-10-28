import { render } from '@testing-library/react'
import React from 'react'

import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('should render correctly', () => {
    const { container } = render(<Skeleton />)
    expect(container).toMatchSnapshot()
  })

  it('should be hidden from screen readers', () => {
    const { container } = render(<Skeleton variant='rectangle' height={120} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('should render one bone per text line', () => {
    const { container } = render(<Skeleton lines={3} />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstChild.childNodes).toHaveLength(3)
  })

  it('should apply the given size', () => {
    const { container } = render(<Skeleton variant='rectangle' width='50%' height={80} />)
    expect(container.firstChild).toHaveStyle({ width: '50%', height: '80px' })
  })

  it('should use the width as the height of a circle', () => {
    const { container } = render(<Skeleton variant='circle' width={48} />)
    expect(container.firstChild).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('should accept other span props', () => {
    const { getByTestId } = render(<Skeleton data-testid='skeleton' />)
    expect(getByTestId('skeleton')).toBeInTheDocument()
  })
})
