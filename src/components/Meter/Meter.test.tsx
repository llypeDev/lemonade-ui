import { render } from '@testing-library/react'
import React from 'react'

import { Meter } from './Meter'

jest.mock('../../util/string')

const barColor = (container: HTMLElement) => container.querySelector('[role="meter"] > div').className

describe('Meter', () => {
  it('should render correctly', () => {
    const { container } = render(<Meter label='Storage' value={7.2} max={10} formatValue={(v) => `${v} GB of 10 GB`} />)
    expect(container).toMatchSnapshot()
  })

  it('should be a meter named by its label', () => {
    const { getByRole } = render(<Meter label='Storage' value={7.2} max={10} formatValue={(v) => `${v} GB of 10 GB`} />)
    const meter = getByRole('meter', { name: 'Storage' })

    expect(meter).toHaveAttribute('aria-valuenow', '7.2')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '10')
    expect(meter).toHaveAttribute('aria-valuetext', '7.2 GB of 10 GB')
  })

  it('should show the percentage by default', () => {
    const { getByText } = render(<Meter label='Quota' value={45} />)
    expect(getByText('45%')).toBeInTheDocument()
  })

  it('should take aria-label without a visible label', () => {
    const { getByRole } = render(<Meter aria-label='Battery' value={80} showValue={false} />)
    expect(getByRole('meter', { name: 'Battery' })).toBeInTheDocument()
  })

  it('should fill the bar by the value', () => {
    const { container } = render(<Meter label='Quota' value={25} min={0} max={50} />)
    expect(container.querySelector('[role="meter"] > div')).toHaveStyle('width: 50%')
  })

  it('should color the bar by how far the value is from the optimum', () => {
    const props = { label: 'Storage', low: 60, high: 85, optimum: 0 }
    const { container, rerender } = render(<Meter {...props} value={30} />)
    const good = barColor(container)

    rerender(<Meter {...props} value={70} />)
    const fair = barColor(container)

    rerender(<Meter {...props} value={95} />)
    const bad = barColor(container)

    expect(new Set([good, fair, bad]).size).toBe(3)

    // Higher is better for a battery, so a full one shows as good
    rerender(<Meter label='Battery' low={20} high={80} optimum={100} value={95} />)
    expect(barColor(container)).toBe(good)
  })
})
