import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { NumberField, NumberFieldProps, parseNumber } from './NumberField'

jest.mock('../../util/string')

const renderField = (props: Partial<NumberFieldProps> = {}) => {
  const onChange = jest.fn()
  const result = render(<NumberField label='Quantity' onChange={onChange} {...props} />)
  const input = result.getByRole('spinbutton', { name: 'Quantity' }) as HTMLInputElement
  return { ...result, input, onChange }
}

describe('NumberField', () => {
  it('should render correctly', () => {
    const { container } = render(<NumberField label='Quantity' defaultValue={2} min={0} max={10} />)
    expect(container).toMatchSnapshot()
  })

  it('should be a spinbutton with its value and limits', () => {
    const { input } = renderField({ defaultValue: 2, min: 0, max: 10 })

    expect(input).toHaveValue('2')
    expect(input).toHaveAttribute('aria-valuenow', '2')
    expect(input).toHaveAttribute('aria-valuemin', '0')
    expect(input).toHaveAttribute('aria-valuemax', '10')
  })

  it('should add and remove one step with the buttons', () => {
    const { input, onChange, getByRole } = renderField({ defaultValue: 2, step: 2 })

    fireEvent.click(getByRole('button', { name: 'Increase' }))
    expect(input).toHaveValue('4')
    expect(onChange).toHaveBeenLastCalledWith(4)

    fireEvent.click(getByRole('button', { name: 'Decrease' }))
    expect(input).toHaveValue('2')
    expect(onChange).toHaveBeenLastCalledWith(2)
  })

  it('should keep the buttons out of the tab order', () => {
    const { getByRole } = renderField()
    expect(getByRole('button', { name: 'Increase' })).toHaveAttribute('tabindex', '-1')
  })

  it('should step with the arrow and page keys', () => {
    const { input } = renderField({ defaultValue: 5 })

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('6')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input).toHaveValue('4')
    fireEvent.keyDown(input, { key: 'PageUp' })
    expect(input).toHaveValue('14')
    fireEvent.keyDown(input, { key: 'PageDown' })
    expect(input).toHaveValue('4')
  })

  it('should go to the limits with Home and End', () => {
    const { input } = renderField({ defaultValue: 5, min: 1, max: 9 })

    fireEvent.keyDown(input, { key: 'End' })
    expect(input).toHaveValue('9')
    fireEvent.keyDown(input, { key: 'Home' })
    expect(input).toHaveValue('1')
  })

  it('should not go beyond the limits and disable the button at each limit', () => {
    const { input, getByRole } = renderField({ defaultValue: 9, max: 10, min: 9 })

    expect(getByRole('button', { name: 'Decrease' })).toBeDisabled()
    fireEvent.click(getByRole('button', { name: 'Increase' }))
    fireEvent.keyDown(input, { key: 'ArrowUp' })

    expect(input).toHaveValue('10')
    expect(getByRole('button', { name: 'Increase' })).toBeDisabled()
  })

  it('should call onChange while typing a number and clamp it on blur', () => {
    const { input, onChange } = renderField({ max: 10 })

    fireEvent.change(input, { target: { value: '25' } })
    expect(onChange).toHaveBeenLastCalledWith(25)

    fireEvent.blur(input)
    expect(input).toHaveValue('10')
    expect(onChange).toHaveBeenLastCalledWith(10)
  })

  it('should accept a comma as the decimal separator', () => {
    const { input, onChange } = renderField()

    fireEvent.change(input, { target: { value: '1,5' } })
    expect(onChange).toHaveBeenLastCalledWith(1.5)
  })

  it('should keep the last number while the text is incomplete and restore it on blur', () => {
    const { input, onChange } = renderField({ defaultValue: 3 })

    fireEvent.change(input, { target: { value: '-' } })
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.blur(input)
    expect(input).toHaveValue('3')
  })

  it('should report null when emptied', () => {
    const { input, onChange } = renderField({ defaultValue: 3 })

    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('should round decimal steps', () => {
    const { input } = renderField({ defaultValue: 0.1, step: 0.2 })

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('0.3')
  })

  it('should follow a controlled value', () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(1)
      return (
        <>
          <NumberField label='Quantity' value={value} onChange={setValue} />
          <button onClick={() => setValue(7)}>Set seven</button>
        </>
      )
    }

    const { getByRole } = render(<Controlled />)
    const input = getByRole('spinbutton')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveValue('2')

    fireEvent.click(getByRole('button', { name: 'Set seven' }))
    expect(input).toHaveValue('7')
  })

  it('should not step when disabled', () => {
    const { input, onChange, getByRole } = renderField({ defaultValue: 1, disabled: true })

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(onChange).not.toHaveBeenCalled()
    expect(getByRole('button', { name: 'Increase' })).toBeDisabled()
  })
})

describe('parseNumber', () => {
  it('should parse numbers with a dot or a comma', () => {
    expect(parseNumber('12')).toBe(12)
    expect(parseNumber(' -3.5 ')).toBe(-3.5)
    expect(parseNumber('0,25')).toBe(0.25)
    expect(parseNumber('.5')).toBe(0.5)
  })

  it('should return null for an empty text and undefined for other texts', () => {
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('-')).toBeUndefined()
    expect(parseNumber('abc')).toBeUndefined()
    expect(parseNumber('1.2.3')).toBeUndefined()
  })
})
