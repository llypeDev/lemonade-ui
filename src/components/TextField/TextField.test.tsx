import { render } from '@testing-library/react'
import React from 'react'

import { TextField } from './TextField'

jest.mock('../../util/string')

it('should render correctly', () => {
  const { container } = render(<TextField label='Label' error='Some error' />)
  expect(container).toMatchSnapshot()
})

describe('error', () => {
  it('should render the error text', () => {
    const { queryByText } = render(<TextField error='Some error' />)
    expect(queryByText('Some error')).toBeTruthy()
  })

  it('input should have an "aria-invalid=true" attribute when "error" is provided', () => {
    const { container } = render(<TextField error='Some error' />)
    expect(container.querySelector('input').getAttribute('aria-invalid')).toEqual('true')
  })

  it('input should have an "aria-errormessage" attribute when "error" is provided', () => {
    const { container } = render(<TextField error='Some error' />)
    expect(container.querySelector('input').getAttribute('aria-errormessage')).toEqual('error-abc')
    expect(container.querySelector('#error-abc').textContent).toEqual('Some error')
  })

  it('should describe the input with the error, after its own description', () => {
    const { container, rerender } = render(<TextField error='Some error' />)
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('aria-describedby', 'error-abc')

    rerender(<TextField error='Some error' aria-describedby='hint' />)
    expect(input).toHaveAttribute('aria-describedby', 'hint error-abc')

    rerender(<TextField aria-describedby='hint' />)
    expect(input).toHaveAttribute('aria-describedby', 'hint')
  })

  it('input should have an "aria-invalid=true" attribute when "invalid" is set', () => {
    const { container } = render(<TextField invalid />)
    expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true')
  })

  it('should let an explicit "aria-invalid" win', () => {
    const { container } = render(<TextField error='Some error' aria-invalid={false} />)
    expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'false')
  })
})

it('should not pass "inline" to the input', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => null)
  try {
    const { container } = render(<TextField label='Name' inline />)
    expect(container.querySelector('input')).not.toHaveAttribute('inline')
    expect(error).not.toHaveBeenCalled()
  } finally {
    error.mockRestore()
  }
})

describe('input label', () => {
  it('label should have a htmlFor prop equals to the used id', () => {
    const { container } = render(<TextField id='foo' label='Foo' />)

    expect(container.querySelector('label').getAttribute('for')).toEqual('foo')
    expect(container).toMatchSnapshot()
  })

  it('should use aria-labelledby equals to an auto-assigned label id, if "id" is not provided', () => {
    const { container } = render(<TextField label='test' />)

    expect(container.querySelector('label').getAttribute('id')).toEqual('label-abc')
    expect(container.querySelector('input').getAttribute('aria-labelledby')).toEqual('label-abc')
    expect(container).toMatchSnapshot()
  })

  it('should not have aria description if "label" prop is not provided', () => {
    const { container } = render(<TextField />)
    expect(container.querySelector('input').getAttribute('aria-labelledby')).toBeFalsy()
  })
})
