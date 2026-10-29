import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { PasswordField } from './PasswordField'

jest.mock('../../util/string')

describe('PasswordField', () => {
  it('should render correctly', () => {
    const { container } = render(<PasswordField label='Password' />)
    expect(container).toMatchSnapshot()
  })

  it('should hide the password by default', () => {
    const { getByLabelText } = render(<PasswordField label='Password' />)
    expect(getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('should show and hide the password with the toggle button', () => {
    const onVisibleChange = jest.fn()
    const { getByLabelText, getByRole } = render(<PasswordField label='Password' onVisibleChange={onVisibleChange} />)
    const toggle = getByRole('button', { name: 'Show password' })

    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(toggle)
    expect(getByLabelText('Password')).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(onVisibleChange).toHaveBeenLastCalledWith(true)

    fireEvent.click(toggle)
    expect(getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(onVisibleChange).toHaveBeenLastCalledWith(false)
  })

  it('should keep the toggle button in the tab order', () => {
    const { getByRole } = render(<PasswordField label='Password' />)
    expect(getByRole('button', { name: 'Show password' })).toHaveAttribute('tabindex', '0')
  })

  it('should start visible with defaultVisible', () => {
    const { getByLabelText } = render(<PasswordField label='Password' defaultVisible />)
    expect(getByLabelText('Password')).toHaveAttribute('type', 'text')
  })

  it('should suggest the current password to password managers by default', () => {
    const { getByLabelText, rerender } = render(<PasswordField label='Password' />)
    expect(getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password')

    rerender(<PasswordField label='Password' autoComplete='new-password' />)
    expect(getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password')
  })

  it('should disable the toggle with the field', () => {
    const { getByRole } = render(<PasswordField label='Password' disabled />)
    expect(getByRole('button', { name: 'Show password' })).toBeDisabled()
  })
})
