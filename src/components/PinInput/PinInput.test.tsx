import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { PinInput } from './PinInput'

jest.mock('../../util/string')

describe('PinInput', () => {
  it('should render correctly', () => {
    const { container } = render(<PinInput label='Verification code' length={4} defaultValue='12' />)
    expect(container).toMatchSnapshot()
  })

  it('should be a single field named by its label, ready for one-time code autofill', () => {
    const { getByLabelText } = render(<PinInput label='Verification code' />)
    const input = getByLabelText('Verification code')

    expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).not.toHaveAttribute('maxlength')
  })

  it('should show one box per character', () => {
    const { container } = render(<PinInput label='Code' length={4} defaultValue='73' />)
    const boxes = container.querySelectorAll('[aria-hidden="true"]')

    expect(boxes).toHaveLength(4)
    expect(boxes[0]).toHaveTextContent('7')
    expect(boxes[1]).toHaveTextContent('3')
    expect(boxes[2]).toHaveTextContent('')
  })

  it('should keep only digits and call onComplete with the full code', () => {
    const onChange = jest.fn()
    const onComplete = jest.fn()
    const { getByLabelText } = render(<PinInput label='Code' onChange={onChange} onComplete={onComplete} />)
    const input = getByLabelText('Code')

    fireEvent.change(input, { target: { value: '12a' } })
    expect(onChange).toHaveBeenLastCalledWith('12')
    expect(input).toHaveValue('12')
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: '123-456' } })
    expect(input).toHaveValue('123456')
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('should cut a pasted code at the length', () => {
    const { getByLabelText } = render(<PinInput label='Code' length={4} />)
    fireEvent.change(getByLabelText('Code'), { target: { value: '987654' } })
    expect(getByLabelText('Code')).toHaveValue('9876')
  })

  it('should accept letters when alphanumeric', () => {
    const { getByLabelText } = render(<PinInput label='Code' type='alphanumeric' />)
    const input = getByLabelText('Code')

    fireEvent.change(input, { target: { value: 'ab-12 c' } })
    expect(input).toHaveValue('ab12c')
    expect(input).toHaveAttribute('inputmode', 'text')
  })

  it('should hide the characters with mask', () => {
    const { getByLabelText, container } = render(<PinInput label='PIN' length={4} defaultValue='1234' mask />)

    expect(getByLabelText('PIN')).toHaveAttribute('type', 'password')
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('•')
  })

  it('should follow the value of a controlled field', () => {
    const Controlled = () => {
      const [code, setCode] = useState('')
      return (
        <>
          <PinInput label='Code' value={code} onChange={setCode} />
          <button onClick={() => setCode('')}>Clear</button>
        </>
      )
    }
    const { getByLabelText, getByRole } = render(<Controlled />)

    fireEvent.change(getByLabelText('Code'), { target: { value: '42' } })
    expect(getByLabelText('Code')).toHaveValue('42')

    fireEvent.click(getByRole('button', { name: 'Clear' }))
    expect(getByLabelText('Code')).toHaveValue('')
  })

  it('should show the error and link it to the field', () => {
    const { getByLabelText, getByRole } = render(<PinInput label='Code' error='The code is wrong' />)
    const input = getByLabelText('Code')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toBe(getByRole('alert').id)
  })

  it('should keep the caret at the end', () => {
    const { getByLabelText } = render(<PinInput label='Code' defaultValue='123' />)
    const input = getByLabelText('Code') as HTMLInputElement

    input.focus()
    input.setSelectionRange(0, 0)
    fireEvent.select(input)
    expect(input.selectionStart).toBe(3)
  })

  it('should replace the code with a pasted one', () => {
    const onComplete = jest.fn()
    const { getByLabelText } = render(<PinInput label='Code' defaultValue='12' onComplete={onComplete} />)
    const input = getByLabelText('Code')

    fireEvent.paste(input, { clipboardData: { getData: () => '987 654' } })
    expect(input).toHaveValue('987654')
    expect(onComplete).toHaveBeenCalledWith('987654')
  })

  it('should ignore a paste without valid characters', () => {
    const { getByLabelText } = render(<PinInput label='Code' defaultValue='12' />)
    fireEvent.paste(getByLabelText('Code'), { clipboardData: { getData: () => 'abc' } })
    expect(getByLabelText('Code')).toHaveValue('12')
  })

  it('should keep a selection, so the user can type over it', () => {
    const { getByLabelText } = render(<PinInput label='Code' defaultValue='123' />)
    const input = getByLabelText('Code') as HTMLInputElement

    input.focus()
    input.setSelectionRange(0, 3)
    fireEvent.select(input)
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(3)
  })

  it('should pass the disabled and name props to the input', () => {
    const { getByLabelText } = render(<PinInput label='Code' name='code' disabled />)
    expect(getByLabelText('Code')).toBeDisabled()
    expect(getByLabelText('Code')).toHaveAttribute('name', 'code')
  })
})
