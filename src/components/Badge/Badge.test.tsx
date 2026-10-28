import { render } from '@testing-library/react'
import React from 'react'

import { Badge } from './Badge'

describe('Badge', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Badge count={3}>
        <button>Inbox</button>
      </Badge>
    )
    expect(container).toMatchSnapshot()
  })

  it('should show the count over its children', () => {
    const { getByText, getByRole } = render(
      <Badge count={3}>
        <button>Inbox</button>
      </Badge>
    )

    expect(getByRole('button', { name: 'Inbox' })).toBeInTheDocument()
    expect(getByText('3')).toBeInTheDocument()
  })

  it('should cap the count at max', () => {
    const { getByText, rerender } = render(<Badge count={120} />)
    expect(getByText('99+')).toBeInTheDocument()

    rerender(<Badge count={12} max={9} />)
    expect(getByText('9+')).toBeInTheDocument()
  })

  it('should hide a zero count unless showZero is set', () => {
    const { container, rerender, getByText } = render(<Badge count={0} />)
    expect(container).toBeEmptyDOMElement()

    rerender(<Badge count={0} showZero />)
    expect(getByText('0')).toBeInTheDocument()
  })

  it('should keep the children when there is nothing to show', () => {
    const { getByText, container } = render(
      <Badge count={0}>
        <span>Child</span>
      </Badge>
    )

    expect(getByText('Child')).toBeInTheDocument()
    expect(container.firstChild.childNodes).toHaveLength(1)
  })

  it('should hide the badge from screen readers unless it has a label', () => {
    const { container: countContainer } = render(<Badge count={3} />)
    expect(countContainer.firstChild).toHaveAttribute('aria-hidden', 'true')

    const { container, rerender, getByText } = render(<Badge dot />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')

    rerender(<Badge dot label='New messages' />)
    expect(container.firstChild).not.toHaveAttribute('aria-hidden')
    expect(getByText('New messages')).toBeInTheDocument()
  })

  it('should read the label instead of the number', () => {
    const { getByText } = render(<Badge count={3} label='3 unread messages' />)

    expect(getByText('3')).toHaveAttribute('aria-hidden', 'true')
    expect(getByText('3 unread messages')).toBeInTheDocument()
  })
})
