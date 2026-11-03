import { render, fireEvent } from '@testing-library/react'
import React from 'react'

import { focusRingStates } from '../../test/utils/resolveStyle'

import { Checkbox, CheckboxMark } from './Checkbox'

describe('Checkbox', () => {
  it('should render correctly', () => {
    const { container } = render(<Checkbox label='check' />)
    expect(container).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const { container } = render(<Checkbox label='check' disabled />)
    expect(container).toMatchSnapshot()
  })
  it('should render correctly when indeterminate', () => {
    const { container } = render(<Checkbox label='check' indeterminate />)
    expect(container).toMatchSnapshot()
  })
  it('should have the indeterminate attribute on input when prop is specified', () => {
    const { container } = render(<Checkbox label='check' indeterminate />)
    const input = container.querySelector('input')
    expect(input.indeterminate).toEqual(true)
  })
  it('should use external inputRef', () => {
    const ref = React.createRef<HTMLInputElement>()

    const { container } = render(<Checkbox label='check' inputRef={ref} defaultChecked={false} />)
    const input = container.querySelector('input')
    fireEvent(input, new MouseEvent('click'))
    expect(input.checked).toBeTruthy()
    expect(ref.current.checked).toBeTruthy()
  })
  it('should show the focus ring on the box for the keyboard, not after a click', () => {
    ;[false, true].forEach((checked) => {
      const { container, unmount } = render(<Checkbox label='check' defaultChecked={checked} />)
      const input = container.querySelector('input')
      const { received, expected } = focusRingStates(input.nextElementSibling, { on: input })
      expect(received).toEqual(expected)
      unmount()
    })
  })
})

describe('CheckboxMark', () => {
  it('should draw only the box, hidden from screen readers', () => {
    const { container } = render(<CheckboxMark />)
    expect(container.querySelector('input')).toBeNull()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
  it('should render correctly when checked', () => {
    const { container } = render(<CheckboxMark checked />)
    expect(container).toMatchSnapshot()
  })
  it('should render correctly when indeterminate', () => {
    const { container } = render(<CheckboxMark indeterminate />)
    expect(container).toMatchSnapshot()
  })
})
