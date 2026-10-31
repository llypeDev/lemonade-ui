import { fireEvent, render, act } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { MonthField } from './MonthField'

// Lets pending updates, such as popper positions and debounced loads, settle inside act
const flush = () => act(async () => undefined)

describe('Component presentation', () => {
  it('should render correctly when closed', async () => {
    const { container } = render(<MonthField value={{ year: 2019, month: 1 }} onChange={jest.fn()} />)
    expect(container).toMatchSnapshot()
    await flush()
  })
  it('should render correctly when opened', async () => {
    const { container } = render(<MonthField value={{ year: 2019, month: 1 }} onChange={jest.fn()} />)
    fireEvent.focus(container.querySelector('input'))
    expect(container).toMatchSnapshot()
    await flush()
  })
  ;['', null, false, undefined].forEach((value: any) => {
    it(`should gracefully treat "${value}" as value`, async () => {
      const { container } = render(<MonthField value={value} />)
      fireEvent.focus(container.querySelector('input'))
      await flush()
    })
  })
})

describe('Component behavior', () => {
  it('should open MonthPicker on focus', async () => {
    const { container, queryByTestId } = render(
      <MonthField onChange={jest.fn()} monthPickerProps={{ visibleMonth: { month: 6, year: 2016 } }} />
    )

    expect(queryByTestId('MonthField.popup')).toBeNull()

    fireEvent.focus(container.querySelector('input'))
    expect(queryByTestId('MonthField.popup')).not.toBeNull()
    await flush()
  })
  it('should call "onChange" when a valid date is typed', async () => {
    const fn = jest.fn()
    const { container } = render(
      <MonthField onChange={fn} monthPickerProps={{ visibleMonth: { month: 6, year: 2016 } }} />
    )

    fireEvent.change(container.querySelector('input'), { target: { value: '08/2016' } })
    expect(fn).toHaveBeenCalledWith({ month: 7, year: 2016 })
    await flush()
  })
  it('should hide MonthPicker when a month is picked', async () => {
    const { container, getByText, queryByTestId } = render(
      <MonthField onChange={jest.fn()} monthPickerProps={{ visibleMonth: { month: 6, year: 2016 } }} />
    )

    fireEvent.focus(container.querySelector('input'))

    expect(queryByTestId('MonthField.popup')).not.toBeNull()
    fireEvent.click(getByText('Jan'))
    expect(queryByTestId('MonthField.popup')).toBeNull()
    await flush()
  })
})

describe('Accessibility and props', () => {
  it('should name the calendar button and use the placeholder of the locale', async () => {
    const { getByRole, container } = render(
      <LocaleContext.Provider value={ptBR}>
        <MonthField value={null} onChange={jest.fn()} />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Abrir calendário' })).toBeInTheDocument()
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'mm/aaaa')
    await flush()
  })

  it('should pass monthPickerProps to the picker and not to the input', async () => {
    const { container, getByTestId } = render(
      <MonthField value={{ year: 2019, month: 1 }} onChange={jest.fn()} monthPickerProps={{ id: 'picker' }} />
    )
    const input = container.querySelector('input')
    expect(input).not.toHaveAttribute('monthpickerprops')
    fireEvent.focus(input)
    expect(getByTestId('MonthField.popup').querySelector('#picker')).toBeInTheDocument()
    await flush()
  })
})
