import { render } from '@testing-library/react'
import React from 'react'

import { Timeline } from './Timeline'

const items = [
  {
    title: 'Order placed',
    time: 'Oct 12, 9:41 AM',
    dateTime: '2026-10-12T09:41',
    icon: 'shoppingCartOutline' as const,
  },
  { title: 'Payment approved', time: 'Oct 12, 9:43 AM', type: 'success' as const, description: 'Credit card' },
  { title: 'Waiting for pickup' },
]

describe('Timeline', () => {
  it('should render correctly', () => {
    const { container } = render(<Timeline items={items} aria-label='Order history' />)
    expect(container).toMatchSnapshot()
  })

  it('should render an ordered list with an item for each event', () => {
    const { getByRole, getAllByRole } = render(<Timeline items={items} aria-label='Order history' />)

    expect(getByRole('list', { name: 'Order history' }).tagName).toBe('OL')
    expect(getAllByRole('listitem')).toHaveLength(3)
    expect(getAllByRole('listitem')[1]).toHaveTextContent('Payment approved')
    expect(getAllByRole('listitem')[1]).toHaveTextContent('Credit card')
  })

  it('should give the time a machine-readable date', () => {
    const { getByText } = render(<Timeline items={items} />)
    const time = getByText('Oct 12, 9:41 AM')

    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('datetime', '2026-10-12T09:41')
  })

  it('should hide the markers from screen readers', () => {
    const { container } = render(<Timeline items={items} />)
    const markers = container.querySelectorAll('li > span')

    expect(markers).toHaveLength(3)
    markers.forEach((marker) => expect(marker).toHaveAttribute('aria-hidden', 'true'))
  })

  it('should render an empty list without items', () => {
    const { container } = render(<Timeline items={[]} />)
    expect(container.querySelectorAll('li')).toHaveLength(0)
  })
})
