import { render } from '@testing-library/react'
import React from 'react'

import { ProgressCircle } from './ProgressCircle'

describe('ProgressCircle', () => {
  it('should render correctly', () => {
    const { container } = render(<ProgressCircle value={60} aria-label='Upload' />)
    expect(container).toMatchSnapshot()
  })

  it('should describe the progress to screen readers', () => {
    const { getByRole } = render(<ProgressCircle value={3} max={4} aria-label='Profile steps' />)
    const progress = getByRole('progressbar', { name: 'Profile steps' })

    expect(progress).toHaveAttribute('aria-valuenow', '3')
    expect(progress).toHaveAttribute('aria-valuemax', '4')
    expect(progress).toHaveAttribute('aria-valuetext', '75%')
  })

  it('should show the percentage in medium and large circles', () => {
    const { container, rerender } = render(<ProgressCircle value={42.4} aria-label='Upload' />)
    expect(container).toHaveTextContent('42%')

    rerender(<ProgressCircle value={42} aria-label='Upload' size='small' />)
    expect(container).not.toHaveTextContent('42%')

    rerender(<ProgressCircle value={42} aria-label='Upload' showValue={false} />)
    expect(container).not.toHaveTextContent('42%')
  })

  it('should spin without a value and be named "Loading"', () => {
    const { getByRole } = render(<ProgressCircle />)
    const progress = getByRole('progressbar', { name: 'Loading' })

    expect(progress).not.toHaveAttribute('aria-valuenow')
    expect(progress).toHaveTextContent('')
  })

  it('should keep the value within the limits', () => {
    const { getByRole } = render(<ProgressCircle value={150} aria-label='Upload' />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuetext', '100%')
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('should not show NaN when max is 0 or the value is not a number', () => {
    const { getByRole, container, rerender } = render(<ProgressCircle value={0} max={0} aria-label='Steps' />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuetext', '0%')
    expect(container).toHaveTextContent('0%')

    rerender(<ProgressCircle value={NaN} aria-label='Steps' />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuetext', '0%')
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(container).not.toHaveTextContent('NaN')
  })
})
