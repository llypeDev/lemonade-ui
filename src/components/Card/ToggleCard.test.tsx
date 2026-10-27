import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { ToggleCard } from './ToggleCard'

it('should render correctly', () => {
  const { container } = render(<ToggleCard>Content</ToggleCard>)
  expect(container).toMatchSnapshot()
})

it('should render a native checkbox labelled by its content', () => {
  const { getByRole } = render(
    <ToggleCard name='plan' value='pro'>
      Pro plan
    </ToggleCard>
  )
  const checkbox = getByRole('checkbox', { name: 'Pro plan' })

  expect(checkbox).toHaveAttribute('name', 'plan')
  expect(checkbox).toHaveAttribute('value', 'pro')
  expect(checkbox).not.toBeChecked()
})

it('should toggle when any part of the card is clicked', () => {
  const onChange = jest.fn()
  const { getByRole, getByText } = render(<ToggleCard onChange={onChange}>Pro plan</ToggleCard>)

  fireEvent.click(getByText('Pro plan'))
  expect(getByRole('checkbox')).toBeChecked()
  expect(onChange).toHaveBeenCalledTimes(1)

  fireEvent.click(getByText('Pro plan'))
  expect(getByRole('checkbox')).not.toBeChecked()
})

it('should start checked with defaultChecked', () => {
  const { getByRole } = render(<ToggleCard defaultChecked>Pro plan</ToggleCard>)
  expect(getByRole('checkbox')).toBeChecked()
})

it('should be controllable', () => {
  const onChange = jest.fn()
  const { getByRole, rerender } = render(
    <ToggleCard checked={false} onChange={onChange}>
      Pro plan
    </ToggleCard>
  )

  fireEvent.click(getByRole('checkbox'))
  expect(onChange).toHaveBeenCalledTimes(1)
  expect(getByRole('checkbox')).not.toBeChecked()

  rerender(
    <ToggleCard checked onChange={onChange}>
      Pro plan
    </ToggleCard>
  )
  expect(getByRole('checkbox')).toBeChecked()
})

it('should not toggle when disabled', () => {
  const onChange = jest.fn()
  const { getByRole, getByText } = render(
    <ToggleCard disabled onChange={onChange}>
      Pro plan
    </ToggleCard>
  )
  const checkbox = getByRole('checkbox')

  expect(checkbox).toBeDisabled()
  fireEvent.click(getByText('Pro plan'))
  expect(onChange).not.toHaveBeenCalled()
  expect(checkbox).not.toBeChecked()
})

it('should expose the invalid state to assistive technologies', () => {
  const { getByRole } = render(<ToggleCard invalid>Pro plan</ToggleCard>)
  expect(getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true')
})
