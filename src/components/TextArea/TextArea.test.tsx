import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBr from '../../i18n/locales/pt-BR'
import { randomStr } from '../../util/string'

import { TextArea } from './TextArea'

jest.mock('../../util/string')

it('should render correctly', () => {
  const { container } = render(<TextArea name='input' label='Label' placeholder='Test' defaultValue='Value' />)
  expect(container).toMatchSnapshot()
})

it('should render correctly when disabled', () => {
  const { container } = render(<TextArea name='input' disabled />)
  expect(container).toMatchSnapshot()
})

it('should render correctly with error', () => {
  const { container } = render(<TextArea name='input' error='Some error' />)
  expect(container).toMatchSnapshot()
})

it('should accept style prop', () => {
  const { container } = render(<TextArea name='input' style={{ color: 'green' }} />)
  expect(container).toMatchSnapshot()
})

it('should render character counter', () => {
  const { container, rerender } = render(<TextArea name='input' defaultValue='Testing counter' maxLength={200} />)
  expect(container).toMatchSnapshot()

  rerender(<TextArea name='input' maxLength={200} />)
  expect(container).toMatchSnapshot()
})

it('should count the characters typed in an uncontrolled textarea', () => {
  const { getByRole, getByText } = render(<TextArea label='Notes' maxLength={100} />)
  expect(getByText('0/100 characters')).toBeInTheDocument()

  fireEvent.change(getByRole('textbox'), { target: { value: 'Hello' } })
  expect(getByText('5/100 characters')).toBeInTheDocument()
})

it('should count zero characters after the default text is erased', () => {
  const { getByRole, getByText } = render(<TextArea label='Notes' defaultValue='Hi' maxLength={100} />)
  fireEvent.change(getByRole('textbox'), { target: { value: '' } })
  expect(getByText('0/100 characters')).toBeInTheDocument()
})

it('should call onChange of an uncontrolled textarea', () => {
  const onChange = jest.fn()
  const { getByRole } = render(<TextArea label='Notes' maxLength={100} onChange={onChange} />)
  fireEvent.change(getByRole('textbox'), { target: { value: 'Hi' } })
  expect(onChange).toHaveBeenCalledTimes(1)
})

it('should translate the character counter', () => {
  const { getByText } = render(
    <LocaleContext.Provider value={ptBr}>
      <TextArea defaultValue='Oi' maxLength={10} />
    </LocaleContext.Provider>
  )
  expect(getByText('2/10 caracteres')).toBeInTheDocument()
})

it('should not pass "error" and "inline" to the textarea', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => null)
  try {
    const { container } = render(<TextArea label='Notes' error='Some error' inline />)
    const textarea = container.querySelector('textarea')
    expect(textarea).not.toHaveAttribute('error')
    expect(textarea).not.toHaveAttribute('inline')
    expect(consoleError).not.toHaveBeenCalled()
  } finally {
    consoleError.mockRestore()
  }
})

describe('error', () => {
  it('should render the error text', () => {
    const { queryByText } = render(<TextArea error='Some error' />)
    expect(queryByText('Some error')).toBeTruthy()
  })

  it('input should have an "aria-invalid=true" attribute when "error" is provided', () => {
    const { container } = render(<TextArea error='Some error' />)
    expect(container.querySelector('textarea').getAttribute('aria-invalid')).toEqual('true')
  })

  it('should describe the textarea with the error', () => {
    const { getByRole } = render(<TextArea error='Some error' aria-describedby='hint' />)
    expect(getByRole('textbox')).toHaveAttribute('aria-describedby', 'hint error-abc')
  })

  it('input should have an "aria-errormessage" attribute when "error" is provided', () => {
    const { container } = render(<TextArea error='Some error' />)
    expect(container.querySelector('textarea').getAttribute('aria-errormessage')).toEqual('error-abc')
    expect(container.querySelector('#error-abc').textContent).toEqual('Some error')
  })
})

describe('textarea label', () => {
  it('label should have a htmlFor prop equals to the used id', () => {
    const { container } = render(<TextArea id='foo' label='Foo' />)

    expect(container.querySelector('label').getAttribute('for')).toEqual('foo')
    expect(container).toMatchSnapshot()
  })

  it('should use aria-labelledby equals to an auto-assigned label id, if "id" is not provided', () => {
    const { container } = render(<TextArea label='test' />)

    expect(container.querySelector('label').getAttribute('id')).toEqual('label-abc')
    expect(container.querySelector('textarea').getAttribute('aria-labelledby')).toEqual('label-abc')
    expect(container).toMatchSnapshot()
  })

  it('should be named by its label when each generated id is different', () => {
    let count = 0
    ;(randomStr as jest.Mock).mockImplementation(() => `id${++count}`)
    try {
      const { getByRole } = render(<TextArea label='Description' />)
      expect(getByRole('textbox', { name: 'Description' })).toBeInTheDocument()
    } finally {
      ;(randomStr as jest.Mock).mockImplementation(() => 'abc')
    }
  })

  it('should not have aria description if "label" prop is not provided', () => {
    const { container } = render(<TextArea />)
    expect(container.querySelector('textarea').getAttribute('aria-labelledby')).toBeFalsy()
  })
})
