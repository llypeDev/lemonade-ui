import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'
import { createTheme } from '../../styles'

import { getMonthNames } from '../../util/locale'
import {
  iterateObjectFields,
  normalizeCssClassNames,
} from '../Calendar/RangeCalendar/DateRangeCalendar/DateRangeCalendar.test'
import { hoverStyle } from '../MonthRangePicker/RangeMonthCalendar/GenericMonthRangeCalendar'
import {
  createMonthStylesFn,
  defaultModifiers,
  defaultModifierStyles,
  MonthPicker,
  MonthPickerProps,
  ReferenceMonth,
} from './MonthPicker'

const date = new Date('2019-01-31')
const visibleMonth = { month: date.getMonth(), year: date.getFullYear() }
const today = new Date()
const currentMonth = { month: today.getMonth(), year: today.getFullYear() }

describe('MonthPicker', () => {
  it('should render correctly with month and year', () => {
    const { container } = render(<MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  it('should change de visible year on "Previous year" button click', () => {
    const onChange = jest.fn()
    const { container } = render(<MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={onChange} />)
    fireEvent.click(container.querySelector('button[title="Previous year"]'))
    const expectedYear = date.getFullYear() - 1
    expect(onChange).toHaveBeenCalledWith({ month: visibleMonth.month, year: expectedYear })
  })

  it('should change de visible year on "Next year" button click', () => {
    const onChange = jest.fn()
    const { container } = render(<MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={onChange} />)
    fireEvent.click(container.querySelector('button[title="Next year"]'))
    const expectedYear = date.getFullYear() + 1
    expect(onChange).toHaveBeenCalledWith({ month: visibleMonth.month, year: expectedYear })
  })

  it('should call "onChange" when a month is selected', () => {
    const onChange = jest.fn()
    const { container } = render(<MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={onChange} />)
    fireEvent.click(container.querySelector('button[title="February"]'))
    expect(onChange).toHaveBeenCalledWith({ month: 1, year: date.getFullYear() })
  })

  it('should change the visible year on re-render', () => {
    const { rerender, getAllByText } = render(
      <MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={jest.fn()} />
    )

    const newYear = date.getFullYear() + 1

    rerender(
      <MonthPicker visibleMonth={{ month: visibleMonth.month, year: newYear }} onVisibleMonthChange={jest.fn()} />
    )
    expect(getAllByText(newYear.toString())).toHaveLength(1)
  })

  it('should call onMonthClick when a month is clicked', () => {
    const click = jest.fn()
    const { container } = render(
      <MonthPicker visibleMonth={visibleMonth} onMonthClick={click} onVisibleMonthChange={jest.fn()} />
    )
    fireEvent.click(container.querySelector('button[title="February"]'))
    expect(click).toHaveBeenCalledWith({ month: 1, year: visibleMonth.year })
  })

  it('should call onMonthHover when a month is hovered', () => {
    const hover = jest.fn()
    const { container } = render(
      <MonthPicker visibleMonth={visibleMonth} onMonthHover={hover} onVisibleMonthChange={jest.fn()} />
    )
    fireEvent.mouseOver(container.querySelector('button[title="February"]'))
    expect(hover).toHaveBeenCalledWith({ month: 1, year: visibleMonth.year })
  })

  describe('default props', () => {
    const theme = createTheme()
    const notExpectecSelectedStyle = defaultModifierStyles.selected(theme)
    const notExpectedHoverStyle = hoverStyle(theme)
    const expectedCurrentStyle = defaultModifierStyles.current(theme)

    it('should define onMonthClick', () => {
      const { container } = render(<MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={jest.fn()} />)

      const button = container.querySelector('button[title="March"]')
      fireEvent.click(button)

      iterateObjectFields(notExpectecSelectedStyle, (fieldName: string, fieldValue: any) =>
        expect(button).not.toHaveStyleRule(normalizeCssClassNames(fieldName), fieldValue)
      )
    })

    it('should define onMonthHover', () => {
      const { container } = render(<MonthPicker visibleMonth={visibleMonth} onVisibleMonthChange={jest.fn()} />)

      const button = container.querySelector('button[title="March"]')
      fireEvent.mouseOver(button)

      iterateObjectFields(notExpectedHoverStyle, (fieldName: string, fieldValue: any) =>
        expect(button).not.toHaveStyleRule(normalizeCssClassNames(fieldName), fieldValue)
      )
    })

    it('should apply the current style by default', () => {
      const { container } = render(<MonthPicker visibleMonth={currentMonth} onVisibleMonthChange={jest.fn()} />)

      const long = getMonthNames('en')[today.getMonth()].long

      const button = container.querySelector(`button[title="${long}"]`)

      iterateObjectFields(expectedCurrentStyle, (fieldName: string, fieldValue: any) =>
        expect(button).toHaveStyleRule(normalizeCssClassNames(fieldName), fieldValue)
      )
    })
  })

  describe('modifiers', () => {
    describe('current', () => {
      it('should return true if date is today', () => {
        expect(defaultModifiers.current(currentMonth, {} as any)).toBeTruthy()
        expect(defaultModifiers.current(visibleMonth, {} as any)).toBeFalsy()
      })
    })
    describe('selected', () => {
      it('should return false by default', () => {
        expect(defaultModifiers.selected(currentMonth, {} as any)).toBeFalsy()
        expect(defaultModifiers.selected(visibleMonth, {} as any)).toBeFalsy()
      })
    })
  })
})

const monthButton = (root: Element, title: string) => root.querySelector<HTMLElement>(`button[title="${title}"]`)
const tabbableMonths = (root: Element) =>
  Array.from(root.querySelectorAll<HTMLButtonElement>('button')).filter(
    (button) => !button.disabled && button.getAttribute('tabindex') !== '-1'
  )

// Follows the visible month, as the month fields do
const ControlledMonthPicker = (props: Partial<MonthPickerProps> & { initialMonth: ReferenceMonth }) => {
  const { initialMonth, ...rest } = props
  const [visible, setVisible] = useState(initialMonth)
  return <MonthPicker {...rest} visibleMonth={visible} onVisibleMonthChange={setVisible} />
}

describe('MonthPicker keyboard', () => {
  it('should put the year buttons and a single month, the selected one, in the tab order', () => {
    const { container } = render(
      <MonthPicker
        visibleMonth={{ month: 0, year: 2019 }}
        onVisibleMonthChange={jest.fn()}
        modifiers={{ selected: (month: ReferenceMonth) => month.month === 4 && month.year === 2019 }}
      />
    )
    expect(tabbableMonths(container)).toEqual([
      monthButton(container, 'Previous year'),
      monthButton(container, 'Next year'),
      monthButton(container, 'May'),
    ])
  })

  it('should put the visible month in the tab order when no month is selected', () => {
    const { container } = render(
      <MonthPicker visibleMonth={{ month: 7, year: 2019 }} onVisibleMonthChange={jest.fn()} />
    )
    expect(tabbableMonths(container)).toEqual([
      monthButton(container, 'Previous year'),
      monthButton(container, 'Next year'),
      monthButton(container, 'August'),
    ])
  })

  it('should put the first enabled month in the tab order when the visible one is disabled', () => {
    const { container } = render(
      <MonthPicker
        visibleMonth={{ month: 1, year: 2019 }}
        onVisibleMonthChange={jest.fn()}
        isDisabled={(month: ReferenceMonth) => month.month < 3}
      />
    )
    expect(tabbableMonths(container)).toEqual([
      monthButton(container, 'Previous year'),
      monthButton(container, 'Next year'),
      monthButton(container, 'April'),
    ])
  })

  it('should move the focus with the arrow keys as in its grid of three columns, and with Home and End', () => {
    const { container } = render(<ControlledMonthPicker initialMonth={{ month: 4, year: 2019 }} />)
    act(() => monthButton(container, 'May').focus())

    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    expect(monthButton(container, 'June')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
    expect(monthButton(container, 'April')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    expect(monthButton(container, 'July')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    expect(monthButton(container, 'January')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'End' })
    expect(monthButton(container, 'December')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'Home' })
    expect(monthButton(container, 'January')).toHaveFocus()

    // The focused month keeps the only tab stop of the months
    expect(monthButton(container, 'January')).toHaveAttribute('tabindex', '0')
    expect(container.querySelectorAll('button[tabindex="0"]')).toHaveLength(1)
  })

  it('should show the previous or the next year when the focus moves past the visible one', () => {
    const { container, getByText } = render(<ControlledMonthPicker initialMonth={{ month: 0, year: 2019 }} />)
    act(() => monthButton(container, 'January').focus())

    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
    expect(getByText('2018')).toBeInTheDocument()
    expect(monthButton(container, 'December')).toHaveFocus()

    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    expect(getByText('2019')).toBeInTheDocument()
    expect(monthButton(container, 'March')).toHaveFocus()

    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    expect(getByText('2018')).toBeInTheDocument()
    expect(monthButton(container, 'December')).toHaveFocus()
  })

  it('should move to the same month of the previous and the next year with PageUp and PageDown', () => {
    const { container, getByText } = render(<ControlledMonthPicker initialMonth={{ month: 4, year: 2019 }} />)
    act(() => monthButton(container, 'May').focus())

    fireEvent.keyDown(document.activeElement, { key: 'PageDown' })
    expect(getByText('2020')).toBeInTheDocument()
    expect(monthButton(container, 'May')).toHaveFocus()

    fireEvent.keyDown(document.activeElement, { key: 'PageUp' })
    fireEvent.keyDown(document.activeElement, { key: 'PageUp' })
    expect(getByText('2018')).toBeInTheDocument()
    expect(monthButton(container, 'May')).toHaveFocus()
  })

  it('should skip the disabled months, which cannot take the focus', () => {
    const { container, getByText } = render(
      <ControlledMonthPicker
        initialMonth={{ month: 4, year: 2019 }}
        isDisabled={(month: ReferenceMonth) =>
          month.month === 5 || month.month === 6 || month.month === 11 || month.year > 2019
        }
      />
    )
    act(() => monthButton(container, 'May').focus())

    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    expect(monthButton(container, 'August')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'End' })
    expect(monthButton(container, 'November')).toHaveFocus()

    // No enabled month that way: the focus stays
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    fireEvent.keyDown(document.activeElement, { key: 'PageDown' })
    expect(getByText('2019')).toBeInTheDocument()
    expect(monthButton(container, 'November')).toHaveFocus()
  })

  it('should cancel the default action of the keys it handles', () => {
    const { container } = render(<ControlledMonthPicker initialMonth={{ month: 4, year: 2019 }} />)
    act(() => monthButton(container, 'May').focus())

    // The arrows and PageDown would scroll the page
    expect(fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })).toBe(false)
    expect(fireEvent.keyDown(document.activeElement, { key: 'PageDown' })).toBe(false)
    expect(fireEvent.keyDown(document.activeElement, { key: 'a' })).toBe(true)
  })
})

describe('getMonthNames', () => {
  it('should return an array of month names in short format', () => {
    expect(getMonthNames('pt-BR')).toEqual([
      { short: 'Jan', long: 'Janeiro' },
      { short: 'Fev', long: 'Fevereiro' },
      { short: 'Mar', long: 'Março' },
      { short: 'Abr', long: 'Abril' },
      { short: 'Mai', long: 'Maio' },
      { short: 'Jun', long: 'Junho' },
      { short: 'Jul', long: 'Julho' },
      { short: 'Ago', long: 'Agosto' },
      { short: 'Set', long: 'Setembro' },
      { short: 'Out', long: 'Outubro' },
      { short: 'Nov', long: 'Novembro' },
      { short: 'Dez', long: 'Dezembro' },
    ])

    expect(getMonthNames('en')).toEqual([
      { short: 'Jan', long: 'January' },
      { short: 'Feb', long: 'February' },
      { short: 'Mar', long: 'March' },
      { short: 'Apr', long: 'April' },
      { short: 'May', long: 'May' },
      { short: 'Jun', long: 'June' },
      { short: 'Jul', long: 'July' },
      { short: 'Aug', long: 'August' },
      { short: 'Sep', long: 'September' },
      { short: 'Oct', long: 'October' },
      { short: 'Nov', long: 'November' },
      { short: 'Dec', long: 'December' },
    ])
  })

  describe('createMonthStylesFn', () => {
    const theme = createTheme()
    it('should return merged styles from all modifiers that apply', () => {
      const stylesCreator = createMonthStylesFn(
        {
          current: () => true,
          selected: () => true,
          birthday: () => false,
        },
        {
          current: defaultModifierStyles.current,
          selected: defaultModifierStyles.selected,
          birthday: defaultModifierStyles.current,
        },
        theme
      )
      expect(stylesCreator({ month: 0, year: 2021 })).toMatchSnapshot()
    })
    it('should throw a error if a style is not provided for a predicate', () => {
      const stylesCreator = createMonthStylesFn(
        {
          current: () => true,
          selected: () => true,
          custom: () => false,
        },
        defaultModifierStyles,
        theme
      )
      expect(() => {
        stylesCreator({ month: 0, year: 2021 })
      }).toThrowError('You must provied a modifierStyle for predicate "custom"')
    })
  })
})
