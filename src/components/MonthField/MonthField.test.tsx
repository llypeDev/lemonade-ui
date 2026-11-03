import { fireEvent, render, act } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'
import { createTheme } from '../../styles'
import { ReferenceMonth } from '../MonthPicker'

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
    fireEvent.click(container.querySelector('input'))
    expect(container).toMatchSnapshot()
    await flush()
  })
  ;['', null, false, undefined].forEach((value: any) => {
    it(`should gracefully treat "${value}" as value`, async () => {
      const { container } = render(<MonthField value={value} />)
      fireEvent.click(container.querySelector('input'))
      await flush()
    })
  })
})

describe('Component behavior', () => {
  it('should open MonthPicker on a click', async () => {
    const { container, queryByTestId } = render(
      <MonthField onChange={jest.fn()} monthPickerProps={{ visibleMonth: { month: 6, year: 2016 } }} />
    )

    expect(queryByTestId('MonthField.popup')).toBeNull()

    fireEvent.click(container.querySelector('input'))
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

    fireEvent.click(container.querySelector('input'))

    expect(queryByTestId('MonthField.popup')).not.toBeNull()
    fireEvent.click(getByText('Jan'))
    expect(queryByTestId('MonthField.popup')).toBeNull()
    await flush()
  })
})

const monthButton = (root: Element, title: string) => root.querySelector<HTMLElement>(`button[title="${title}"]`)

// The elements that Tab goes through, in order
const tabOrder = (root: Element) =>
  Array.from(root.querySelectorAll<HTMLElement>('input, button, [tabindex]')).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1'
  )

describe('Opening, closing and keyboard', () => {
  it('should not open the picker when the input gets the focus', async () => {
    const { container, queryByTestId } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    act(() => container.querySelector('input').focus())
    expect(queryByTestId('MonthField.popup')).toBeNull()
    await flush()
  })

  it('should open the picker on a click on the input and on the calendar button', async () => {
    const { container, queryByTestId, getByRole } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    const input = container.querySelector('input')

    fireEvent.click(input)
    expect(queryByTestId('MonthField.popup')).not.toBeNull()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(queryByTestId('MonthField.popup')).toBeNull()

    fireEvent.click(getByRole('button', { name: 'Open calendar' }))
    expect(queryByTestId('MonthField.popup')).not.toBeNull()
    await flush()
  })

  it('should close the picker with Escape and keep the focus in the input', async () => {
    const { container, queryByTestId } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    const input = container.querySelector('input')
    act(() => input.focus())
    fireEvent.click(input)

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(queryByTestId('MonthField.popup')).toBeNull()
    expect(input).toHaveFocus()
    await flush()
  })

  it('should open with Alt+ArrowDown, move the focus to the selected month and give it back to the input with Escape', async () => {
    const { container, queryByTestId } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    const input = container.querySelector('input')
    act(() => input.focus())

    expect(fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })).toBe(false)
    expect(monthButton(container, 'February')).toHaveFocus()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(queryByTestId('MonthField.popup')).toBeNull()
    expect(input).toHaveFocus()
    await flush()
  })

  it('should pick a month with the keyboard, close the picker and keep the focus in the input', async () => {
    const change = jest.fn()
    const { container, queryByTestId } = render(<MonthField value={{ year: 2019, month: 1 }} onChange={change} />)
    const input = container.querySelector('input')
    act(() => input.focus())

    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    // Enter and Space click the focused button
    fireEvent.click(document.activeElement)

    expect(change).toHaveBeenCalledWith({ month: 2, year: 2019 })
    expect(queryByTestId('MonthField.popup')).toBeNull()
    expect(input).toHaveFocus()
    await flush()
  })

  it('should show the year of the value again when the picker opens after showing another year', async () => {
    const { container, getByText } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    const input = container.querySelector('input')
    act(() => input.focus())

    fireEvent.click(input)
    fireEvent.click(monthButton(container, 'Next year'))
    expect(getByText('2020')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Escape' })

    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    expect(getByText('2019')).toBeInTheDocument()
    expect(monthButton(container, 'February')).toHaveFocus()
    await flush()
  })

  it('should put the year buttons and one month in the tab order after the input', async () => {
    const { container } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    const input = container.querySelector('input')
    fireEvent.click(input)

    expect(tabOrder(container)).toEqual([
      input,
      monthButton(container, 'Previous year'),
      monthButton(container, 'Next year'),
      monthButton(container, 'February'),
    ])
    await flush()
  })

  it('should let the popup take the focus, so a click on its empty space keeps it open', async () => {
    const { container, getByTestId } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    fireEvent.click(container.querySelector('input'))

    const popup = getByTestId('MonthField.popup')
    act(() => popup.focus())
    expect(popup).toHaveFocus()
    await flush()
  })
})

describe('Without onChange', () => {
  it('should not crash when a month is typed or picked', async () => {
    const { container, getByText } = render(
      <MonthField monthPickerProps={{ visibleMonth: { month: 6, year: 2016 } }} />
    )

    fireEvent.change(container.querySelector('input'), { target: { value: '08/2016' } })
    fireEvent.click(container.querySelector('input'))
    fireEvent.click(getByText('Jan'))
    await flush()
  })
})

describe('Accessibility and props', () => {
  it('should keep the selected modifier when monthPickerProps has other modifiers', async () => {
    const { container } = render(
      <MonthField
        value={{ year: 2019, month: 1 }}
        monthPickerProps={{
          modifiers: { quarter: (month: ReferenceMonth) => month.month % 3 === 0 },
          modifierStyles: { quarter: () => ({ color: 'red' }) },
        }}
      />
    )
    fireEvent.click(container.querySelector('input'))
    const selectedBackground = createTheme().pallete.primary.main
    expect(container.querySelector('button[title="February"]')).toHaveStyleRule('background', selectedBackground)
    expect(container.querySelector('button[title="April"]')).toHaveStyleRule('color', 'red')
    await flush()
  })

  it('should expose the placement of the popper, which popperProps can change', async () => {
    const { getByTestId, container, rerender } = render(<MonthField value={{ year: 2019, month: 1 }} />)
    fireEvent.click(container.querySelector('input'))
    await flush()
    expect(getByTestId('MonthField.popup')).toHaveAttribute('data-placement', 'bottom-start')

    rerender(<MonthField value={{ year: 2019, month: 1 }} popperProps={{ placement: 'top-end' } as any} />)
    await flush()
    expect(getByTestId('MonthField.popup')).toHaveAttribute('data-placement', 'top-end')
  })

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
    fireEvent.click(input)
    expect(getByTestId('MonthField.popup').querySelector('#picker')).toBeInTheDocument()
    await flush()
  })
})
