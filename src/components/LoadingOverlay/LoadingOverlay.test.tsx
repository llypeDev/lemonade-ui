import { render } from '@testing-library/react'
import React from 'react'

import { LoadingOverlay } from './LoadingOverlay'

describe('LoadingOverlay', () => {
  it('should render correctly', () => {
    const { container } = render(
      <LoadingOverlay loading label='Loading orders'>
        <p>Orders</p>
      </LoadingOverlay>
    )
    expect(container).toMatchSnapshot()
  })

  it('should cover the content while loading and announce it', () => {
    const { container, getByRole, getByText, rerender } = render(
      <LoadingOverlay loading>
        <button>Export</button>
      </LoadingOverlay>
    )
    const root = container.firstElementChild

    expect(root).toHaveAttribute('aria-busy', 'true')
    expect(getByText('Export', { selector: 'button' }).parentElement).toHaveAttribute('inert')
    expect(getByRole('status')).toHaveTextContent('Loading')

    rerender(
      <LoadingOverlay loading={false}>
        <button>Export</button>
      </LoadingOverlay>
    )
    expect(root).toHaveAttribute('aria-busy', 'false')
    expect(getByRole('button', { name: 'Export' }).parentElement).not.toHaveAttribute('inert')
    expect(getByRole('status')).toHaveTextContent('')
  })

  it('should show and announce the label', () => {
    const { getByRole, getAllByText } = render(
      <LoadingOverlay loading label='Loading orders'>
        <p>Orders</p>
      </LoadingOverlay>
    )
    expect(getAllByText('Loading orders')).toHaveLength(2)
    expect(getByRole('status')).toHaveTextContent('Loading orders')
  })
})
