import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { CurrencyField, CurrencyFieldProps, formatCurrency } from './CurrencyField'

jest.mock('../../util/string')

const Controlled = (props: Partial<CurrencyFieldProps> & { initial?: number | null }) => {
  const { initial = null, onChange, ...rest } = props
  const [value, setValue] = useState<number | null>(initial)
  return (
    <CurrencyField
      label='Price'
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange && onChange(next)
      }}
      {...rest}
    />
  )
}

const type = (input: HTMLElement, text: string) => fireEvent.change(input, { target: { value: text } })

describe('CurrencyField', () => {
  it('should render correctly', () => {
    const { container } = render(<CurrencyField label='Price' defaultValue={1234.5} />)
    expect(container).toMatchSnapshot()
  })

  it('should format amounts', () => {
    const brl = { currency: 'R$', decimalSeparator: ',', thousandsSeparator: '.', decimals: 2 }
    expect(formatCurrency(1234567.891, brl)).toBe('R$ 1.234.567,89')
    expect(formatCurrency(0.5, brl)).toBe('R$ 0,50')
    expect(formatCurrency(-12, brl)).toBe('-R$ 12,00')
    expect(formatCurrency(1234.5, { currency: '$', decimalSeparator: '.', thousandsSeparator: ',', decimals: 2 })).toBe(
      '$ 1,234.50'
    )
    expect(formatCurrency(1234, { currency: '', decimalSeparator: ',', thousandsSeparator: '.', decimals: 0 })).toBe(
      '1.234'
    )
  })

  it('should fill the amount from the cents as the user types', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled onChange={onChange} />)
    const input = getByRole('textbox', { name: 'Price' })

    expect(input).toHaveAttribute('placeholder', 'R$ 0,00')
    expect(input).toHaveAttribute('inputmode', 'decimal')
    type(input, '1')
    expect(input).toHaveValue('R$ 0,01')
    type(input, 'R$ 0,012')
    type(input, 'R$ 0,123')
    type(input, 'R$ 1,234')
    expect(input).toHaveValue('R$ 12,34')
    type(input, 'R$ 12,345')
    type(input, 'R$ 123,456')
    expect(input).toHaveValue('R$ 1.234,56')
    expect(onChange).toHaveBeenLastCalledWith(1234.56)
  })

  it('should remove the last digit with Backspace and clear the field', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled initial={12.34} onChange={onChange} />)
    const input = getByRole('textbox')

    type(input, 'R$ 12,3')
    expect(input).toHaveValue('R$ 1,23')
    type(input, '')
    expect(input).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('should take a pasted amount', () => {
    const { getByRole } = render(<Controlled />)
    const input = getByRole('textbox')
    type(input, '1.234,56')
    expect(input).toHaveValue('R$ 1.234,56')
  })

  it('should turn the amount negative with the minus key only when allowed', () => {
    const onChange = jest.fn()
    const { getByRole, rerender } = render(<Controlled initial={10} onChange={onChange} />)
    const input = getByRole('textbox')

    fireEvent.keyDown(input, { key: '-' })
    expect(input).toHaveValue('R$ 10,00')

    rerender(<Controlled initial={10} onChange={onChange} allowNegative />)
    fireEvent.keyDown(input, { key: '-' })
    expect(input).toHaveValue('-R$ 10,00')
    expect(onChange).toHaveBeenLastCalledWith(-10)

    type(input, '-R$ 10,005')
    expect(input).toHaveValue('-R$ 100,05')

    fireEvent.keyDown(input, { key: '+' })
    expect(onChange).toHaveBeenLastCalledWith(100.05)
  })

  it('should keep the amount between min and max when the field loses the focus', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled min={5} max={100} onChange={onChange} />)
    const input = getByRole('textbox')

    type(input, '25000')
    fireEvent.blur(input)
    expect(input).toHaveValue('R$ 100,00')

    type(input, '1')
    fireEvent.blur(input)
    expect(onChange).toHaveBeenLastCalledWith(5)
  })

  it('should accept another currency and format', () => {
    const { getByRole } = render(
      <Controlled currency='US$' decimalSeparator='.' thousandsSeparator=',' initial={1999.9} />
    )
    expect(getByRole('textbox')).toHaveValue('US$ 1,999.90')
  })

  it('should show the label, the error and work uncontrolled', () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <CurrencyField label='Amount' error='Enter an amount' onChange={onChange} required />
    )
    const input = getByRole('textbox', { name: /Amount/ })

    expect(getByText('Enter an amount')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    type(input, '500')
    expect(input).toHaveValue('R$ 5,00')
    expect(onChange).toHaveBeenCalledWith(5)
  })
})
