import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { DateTimeField, DateTimeFieldProps } from './DateTimeField'

jest.mock('../../util/string')

const Controlled = (props: Partial<DateTimeFieldProps> & { initial?: Date | null }) => {
  const { initial = null, onChange, ...rest } = props
  const [value, setValue] = useState<Date | null>(initial)
  return (
    <DateTimeField
      label='Starts at'
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange && onChange(next)
      }}
      {...rest}
    />
  )
}

describe('DateTimeField', () => {
  it('should render correctly', () => {
    const { container } = render(
      <DateTimeField id='start' label='Starts at' value={new Date(2024, 4, 10, 14, 30)} required />
    )
    expect(container).toMatchSnapshot()
  })

  it('should group a date and a time field under the label', () => {
    const { getByRole } = render(<DateTimeField label='Starts at' />)

    expect(getByRole('group', { name: 'Starts at' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Date' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Time' })).toBeInTheDocument()
  })

  it('should show the date and the time of the value', () => {
    const { getByRole } = render(<DateTimeField label='Starts at' value={new Date(2024, 4, 10, 9, 5)} />)

    expect(getByRole('textbox', { name: 'Date' })).toHaveValue('10/05/2024')
    expect(getByRole('textbox', { name: 'Time' })).toHaveValue('09:05')
  })

  it('should call onChange with the moment only when both parts are complete', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled onChange={onChange} />)

    fireEvent.change(getByRole('textbox', { name: 'Date' }), { target: { value: '10/05/2024' } })
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.change(getByRole('textbox', { name: 'Time' }), { target: { value: '14:30' } })
    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 4, 10, 14, 30))
  })

  it('should call onChange with null when a part is cleared', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled initial={new Date(2024, 4, 10, 14, 30)} onChange={onChange} />)

    fireEvent.change(getByRole('textbox', { name: 'Time' }), { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(getByRole('textbox', { name: 'Date' })).toHaveValue('10/05/2024')
  })

  it('should not accept an hour out of range', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled initial={new Date(2024, 4, 10, 14, 30)} onChange={onChange} />)

    fireEvent.change(getByRole('textbox', { name: 'Time' }), { target: { value: '25:00' } })
    expect(onChange).not.toHaveBeenLastCalledWith(expect.any(Date))
  })

  it('should follow a new value from the parent', () => {
    const { getByRole, rerender } = render(<DateTimeField label='Starts at' value={new Date(2024, 4, 10, 9, 0)} />)

    rerender(<DateTimeField label='Starts at' value={new Date(2025, 0, 2, 18, 45)} />)
    expect(getByRole('textbox', { name: 'Date' })).toHaveValue('02/01/2025')
    expect(getByRole('textbox', { name: 'Time' })).toHaveValue('18:45')
  })

  it('should show the error and mark both fields', () => {
    const { getByRole, getByText } = render(<DateTimeField label='Starts at' error='Pick a time in the future' />)
    const error = getByText('Pick a time in the future')

    expect(getByRole('textbox', { name: 'Date' })).toHaveAttribute('aria-errormessage', error.id)
    expect(getByRole('textbox', { name: 'Time' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('should name the fields in a form', () => {
    const { getByRole } = render(<DateTimeField label='Starts at' name='start' id='start' />)

    expect(getByRole('textbox', { name: 'Date' })).toHaveAttribute('name', 'start-date')
    expect(getByRole('textbox', { name: 'Time' })).toHaveAttribute('id', 'start-time')
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <DateTimeField label='Início' />
      </LocaleContext.Provider>
    )
    expect(getByRole('textbox', { name: 'Data' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Hora' })).toBeInTheDocument()
  })
})
