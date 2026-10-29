import { render } from '@testing-library/react'
import React from 'react'

import { VisuallyHidden } from './VisuallyHidden'

describe('VisuallyHidden', () => {
  it('should render correctly', () => {
    const { container } = render(<VisuallyHidden>Unread messages</VisuallyHidden>)
    expect(container).toMatchSnapshot()
  })

  it('should keep the content in the accessibility tree', () => {
    const { getByRole } = render(
      <button>
        <span aria-hidden='true'>×</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>
    )
    expect(getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('should render a span by default and the given component otherwise', () => {
    const { getByText } = render(
      <>
        <VisuallyHidden>Inline</VisuallyHidden>
        <VisuallyHidden component='h2'>Section</VisuallyHidden>
      </>
    )
    expect(getByText('Inline').tagName).toBe('SPAN')
    expect(getByText('Section').tagName).toBe('H2')
  })

  it('should pass other props to the element', () => {
    const { getByText } = render(
      <VisuallyHidden id='hint' role='status'>
        Copied
      </VisuallyHidden>
    )
    expect(getByText('Copied')).toHaveAttribute('id', 'hint')
    expect(getByText('Copied')).toHaveAttribute('role', 'status')
  })
})
