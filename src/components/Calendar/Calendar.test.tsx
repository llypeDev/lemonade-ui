import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { createTheme } from '../../styles'

import * as CalendarModule from './Calendar'

import {
  Calendar,
  CalendarProps,
  createStylesFn,
  defaultModifierStyles,
  defaultDayModifiers,
  defaultWeekModifiers,
} from './Calendar'
import { createWeekArray, isSameDay } from './util'

describe('Calendar', () => {
  it('should mark the disabled days, so screen readers announce them', () => {
    const visibleDate = new Date('2018-10-01T12:00:00')
    const { container } = render(
      <Calendar
        visibleDate={visibleDate}
        onVisibleDateChange={jest.fn()}
        modifiers={{ disabled: (day: Date) => day.getDate() === 15 }}
      />
    )

    const day = (date: string) => container.querySelector(`td[data-date="${date}"] [role="button"]`)
    expect(day('2018-10-15')).toHaveAttribute('aria-disabled', 'true')
    expect(day('2018-10-16')).not.toHaveAttribute('aria-disabled')
  })

  it('should render correctly', () => {
    const { container } = render(
      <Calendar
        visibleDate={new Date('2018-10-26')}
        onVisibleDateChange={jest.fn()}
        modifiers={{
          selected: (day: Date) => isSameDay(day, new Date('2018-10-27')),
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should change visibleDate when year is changed', () => {
    const visibleDateChange = jest.fn()
    const { getByTitle } = render(
      <Calendar visibleDate={new Date('2018-10-26')} onVisibleDateChange={visibleDateChange} />
    )
    const nextYearButton = getByTitle('Next year')

    expect(visibleDateChange).not.toHaveBeenCalled()
    fireEvent.click(nextYearButton)
    expect(visibleDateChange).toHaveBeenCalledWith(new Date(2019, 9, 1))
  })

  it('should change visibleDate when month is changed', () => {
    const visibleDateChange = jest.fn()
    const { getByTitle } = render(
      <Calendar visibleDate={new Date('2018-10-26')} onVisibleDateChange={visibleDateChange} />
    )
    const nextMonthButton = getByTitle('Next month')

    expect(visibleDateChange).not.toHaveBeenCalled()
    fireEvent.click(nextMonthButton)
    expect(visibleDateChange).toHaveBeenCalledWith(new Date(2018, 10, 1))
  })

  it('should change visibleDate when day is clicked', () => {
    const visibleDateChange = jest.fn()
    const { container } = render(
      <Calendar visibleDate={new Date('2018-10-26')} onVisibleDateChange={visibleDateChange} />
    )
    const dateOfPreviousMonthButton = container.querySelector('[data-date="2018-09-30"] span')

    expect(visibleDateChange).not.toHaveBeenCalled()
    fireEvent.click(dateOfPreviousMonthButton)
    expect(visibleDateChange).toHaveBeenCalledWith(new Date('2018-09-30'))
  })

  it('should call onDayClick when day is clicked', () => {
    const click = jest.fn()
    const { container } = render(
      <Calendar visibleDate={new Date('2018-10-26')} onVisibleDateChange={jest.fn()} onDayClick={click} />
    )
    const dateButton = container.querySelector('[data-date="2018-10-01"] span')

    expect(click).not.toHaveBeenCalled()
    fireEvent.click(dateButton)
    expect(click).toHaveBeenCalledWith(new Date('2018-10-01'))
  })

  it('should call onWeekClick when week is clicked', () => {
    const click = jest.fn()
    const { container } = render(
      <Calendar visibleDate={new Date('2021-01-03')} onVisibleDateChange={jest.fn()} onWeekClick={click} onlyWeeks />
    )
    const weekButton = container.querySelector('[data-week="10/01/2021-16/01/2021"]')

    expect(click).not.toHaveBeenCalled()
    fireEvent.click(weekButton)
    expect(click).toHaveBeenCalledWith({ start: new Date('2021-01-10'), end: new Date('2021-01-16') })
  })

  it('should accept modifiers and modifierStyles props', () => {
    const spy = jest.spyOn(CalendarModule, 'createStylesFn')
    const customModifiers = {
      today: () => true,
      custom: () => false,
    }
    const customStyles = {
      today: () => ({ color: 'red' }),
      custom: () => ({ backgroundColor: 'pink' }),
    }
    expect(spy).not.toHaveBeenCalled()
    render(
      <Calendar
        visibleDate={new Date('2018-10-26')}
        onVisibleDateChange={jest.fn()}
        modifiers={customModifiers}
        modifierStyles={customStyles}
      />
    )
    expect(spy).toHaveBeenCalledWith(
      { ...defaultDayModifiers, ...customModifiers },
      { ...defaultModifierStyles, ...customStyles },
      expect.anything()
    )
  })
})

const pad = (n: number) => String(n).padStart(2, '0')
const dateAttr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const dayButton = (container: HTMLElement, date: string) =>
  container.querySelector<HTMLElement>(`td[data-date="${date}"] [role="button"]`)
const tabbableDays = (container: HTMLElement) => container.querySelectorAll('td [role="button"][tabindex="0"]')

// Follows the visible date, as the date fields do
const ControlledCalendar = (props: Partial<CalendarProps> & { initialDate: Date }) => {
  const { initialDate, ...rest } = props
  const [visibleDate, setVisibleDate] = useState(initialDate)
  return <Calendar {...rest} visibleDate={visibleDate} onVisibleDateChange={setVisibleDate} />
}

describe('Calendar keyboard', () => {
  it('should make only the selected day tabbable', () => {
    const { container } = render(
      <Calendar
        visibleDate={new Date(2018, 9, 26)}
        onVisibleDateChange={jest.fn()}
        modifiers={{ selected: (day: Date) => isSameDay(day, new Date(2018, 9, 27)) }}
      />
    )
    expect(tabbableDays(container)).toHaveLength(1)
    expect(dayButton(container, '2018-10-27')).toHaveAttribute('tabindex', '0')
    expect(container.querySelectorAll('td [role="button"][tabindex="-1"]')).toHaveLength(34)
  })

  it('should make the selected day of isDaySelected tabbable, preferring the visible date', () => {
    const { container } = render(
      <Calendar
        visibleDate={new Date(2018, 9, 20)}
        onVisibleDateChange={jest.fn()}
        isDaySelected={(day: Date) => day.getMonth() === 9 && day.getDate() >= 10 && day.getDate() <= 20}
      />
    )
    expect(tabbableDays(container)).toHaveLength(1)
    expect(dayButton(container, '2018-10-20')).toHaveAttribute('tabindex', '0')
  })

  it('should make today tabbable when no visible day is selected', () => {
    const today = new Date()
    const { container } = render(<Calendar visibleDate={today} onVisibleDateChange={jest.fn()} />)
    expect(tabbableDays(container)).toHaveLength(1)
    expect(dayButton(container, dateAttr(today))).toHaveAttribute('tabindex', '0')
  })

  it('should make the first enabled day tabbable when neither the selected day nor today is visible', () => {
    const { container } = render(
      <Calendar
        visibleDate={new Date(2018, 9, 26)}
        onVisibleDateChange={jest.fn()}
        modifiers={{
          selected: (day: Date) => isSameDay(day, new Date(2018, 10, 10)),
          disabled: (day: Date) => day < new Date(2018, 9, 5),
        }}
      />
    )
    expect(tabbableDays(container)).toHaveLength(1)
    expect(dayButton(container, '2018-10-05')).toHaveAttribute('tabindex', '0')
  })

  it('should move the focus by day with the left and right arrows and by week with the up and down arrows', () => {
    const { container } = render(<ControlledCalendar initialDate={new Date(2018, 9, 10)} />)
    act(() => dayButton(container, '2018-10-10').focus())

    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    expect(dayButton(container, '2018-10-11')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
    expect(dayButton(container, '2018-10-09')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    expect(dayButton(container, '2018-10-16')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    expect(dayButton(container, '2018-10-02')).toHaveFocus()

    // The focused day keeps the only tab stop
    expect(tabbableDays(container)).toHaveLength(1)
    expect(dayButton(container, '2018-10-02')).toHaveAttribute('tabindex', '0')
  })

  it('should move the focus to the start and the end of the week with Home and End', () => {
    const { container } = render(<ControlledCalendar initialDate={new Date(2018, 9, 10)} />)
    act(() => dayButton(container, '2018-10-10').focus())

    fireEvent.keyDown(document.activeElement, { key: 'Home' })
    expect(dayButton(container, '2018-10-07')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'End' })
    expect(dayButton(container, '2018-10-13')).toHaveFocus()
  })

  it('should show the next or the previous month when the focus moves past the visible one', () => {
    const { container, getByText, queryByText } = render(<ControlledCalendar initialDate={new Date(2018, 9, 30)} />)
    act(() => dayButton(container, '2018-10-30').focus())

    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    expect(getByText('Nov')).toBeInTheDocument()
    expect(queryByText('Oct')).toBeNull()
    expect(dayButton(container, '2018-11-06')).toHaveFocus()
    expect(dayButton(container, '2018-11-06')).toHaveAttribute('tabindex', '0')

    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    expect(getByText('Oct')).toBeInTheDocument()
    expect(dayButton(container, '2018-10-30')).toHaveFocus()
  })

  it('should move by month with PageUp and PageDown and by year with Shift, keeping the day in the month', () => {
    const { container } = render(<ControlledCalendar initialDate={new Date(2020, 0, 31)} />)
    act(() => dayButton(container, '2020-01-31').focus())

    fireEvent.keyDown(document.activeElement, { key: 'PageDown' })
    expect(dayButton(container, '2020-02-29')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'PageDown', shiftKey: true })
    expect(dayButton(container, '2021-02-28')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'PageUp', shiftKey: true })
    expect(dayButton(container, '2020-02-28')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'PageUp' })
    expect(dayButton(container, '2020-01-28')).toHaveFocus()
  })

  it('should select the focused day with Enter and Space, but not a disabled day', () => {
    const click = jest.fn()
    const { container } = render(
      <ControlledCalendar
        initialDate={new Date(2018, 9, 10)}
        onDayClick={click}
        modifiers={{ disabled: (day: Date) => day.getDate() === 11 }}
      />
    )
    act(() => dayButton(container, '2018-10-10').focus())

    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    expect(click).toHaveBeenLastCalledWith(new Date(2018, 9, 10))
    fireEvent.keyDown(document.activeElement, { key: ' ' })
    expect(click).toHaveBeenCalledTimes(2)

    // A disabled day takes the focus, so the arrows can go through it, but it cannot be picked
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    expect(dayButton(container, '2018-10-11')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    expect(click).toHaveBeenCalledTimes(2)
  })

  it('should cancel the default action of the keys it handles', () => {
    const { container } = render(<ControlledCalendar initialDate={new Date(2018, 9, 10)} />)
    act(() => dayButton(container, '2018-10-10').focus())

    // Space would scroll the page, and Enter would reach the input that gets the focus and submit its form
    expect(fireEvent.keyDown(document.activeElement, { key: ' ' })).toBe(false)
    expect(fireEvent.keyDown(document.activeElement, { key: 'Enter' })).toBe(false)
    expect(fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })).toBe(false)
    expect(fireEvent.keyDown(document.activeElement, { key: 'a' })).toBe(true)
  })

  it('should select the week of the focused day with Enter when only weeks are picked', () => {
    const click = jest.fn()
    const { container } = render(
      <ControlledCalendar initialDate={new Date(2021, 0, 13)} onWeekClick={click} onlyWeeks />
    )
    const tabbable = tabbableDays(container)
    expect(tabbable).toHaveLength(1)

    // Nothing is selected and today is not visible: the first day of the month
    expect(tabbable[0]).toHaveTextContent('01')
    act(() => (tabbable[0] as HTMLElement).focus())
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    expect(document.activeElement).toHaveTextContent('15')

    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    expect(click).toHaveBeenLastCalledWith({ start: new Date(2021, 0, 10), end: new Date(2021, 0, 16) })
  })

  it('should put the month and year buttons in the tab order', () => {
    const { getByTitle } = render(<Calendar visibleDate={new Date(2018, 9, 26)} onVisibleDateChange={jest.fn()} />)
    ;['Previous month', 'Next month', 'Previous year', 'Next year'].forEach((title) =>
      expect(getByTitle(title)).not.toHaveAttribute('tabindex', '-1')
    )
  })
})

describe('modifiers', () => {
  describe('today', () => {
    it('should return true if date is today', () => {
      expect(defaultDayModifiers.today(new Date(), {} as any)).toBeTruthy()
      expect(defaultDayModifiers.today(new Date('1970-01-01'), {} as any)).toBeFalsy()
      expect(defaultDayModifiers.today(new Date(), {} as any)).toBeTruthy()
      expect(defaultDayModifiers.today(new Date('1970-01-01'), {} as any)).toBeFalsy()

      const week = createWeekArray(new Date())
      expect(defaultWeekModifiers.today({ start: week[0], end: week[6] }, {} as any)).toBeTruthy()
      expect(
        defaultWeekModifiers.today({ start: new Date('2021-01-10'), end: new Date('2021-01-16') }, {} as any)
      ).toBeFalsy()
    })
  })
  describe('adjacentMonth', () => {
    it('should return true if date is next or prev month', () => {
      expect(
        defaultDayModifiers.adjacentMonth(new Date('2018-10-01'), { visibleDate: new Date('2018-10-01') })
      ).toBeFalsy()
      expect(
        defaultDayModifiers.adjacentMonth(new Date('2018-10-01'), { visibleDate: new Date('2018-09-01') })
      ).toBeTruthy()
      expect(
        defaultDayModifiers.adjacentMonth(new Date('2018-10-01'), { visibleDate: new Date('2018-11-01') })
      ).toBeTruthy()
    })
  })
  describe('selected', () => {
    it('should return false by default', () => {
      expect(defaultDayModifiers.selected(new Date(), {} as any)).toBeFalsy()

      expect(defaultDayModifiers.selected(new Date(), {} as any)).toBeFalsy()
      expect(
        defaultWeekModifiers.selected({ start: new Date('2021-01-10'), end: new Date('2021-01-16') }, {} as any)
      ).toBeFalsy()
    })
  })
  describe('disabled', () => {
    it('should return false by default', () => {
      expect(defaultDayModifiers.disabled(new Date(), {} as any)).toBeFalsy()
      expect(defaultDayModifiers.disabled(new Date(), {} as any)).toBeFalsy()
      expect(
        defaultWeekModifiers.disabled({ start: new Date('2021-01-10'), end: new Date('2021-01-16') }, {} as any)
      ).toBeFalsy()
    })
  })
})

describe('modifierStyles', () => {
  const theme = createTheme()

  it('should have "today" styles', () => {
    expect(defaultModifierStyles.today(theme)).toMatchSnapshot()
  })

  it('should have "disabled" styles', () => {
    expect(defaultModifierStyles.disabled(theme)).toMatchSnapshot()
  })

  it('should have "selected" styles', () => {
    expect(defaultModifierStyles.selected(theme)).toMatchSnapshot()
  })

  it('should have "adjacentMonth" styles', () => {
    expect(defaultModifierStyles.adjacentMonth(theme)).toMatchSnapshot()
  })
})

describe('createDayStylesFn', () => {
  const theme = createTheme()
  it('should return merged styles from all modifiers that apply', () => {
    const stylesCreator = createStylesFn(
      {
        today: () => true,
        disabled: () => true,
        adjacentMonth: () => true,
        selected: () => true,
      },
      defaultModifierStyles,
      theme
    )
    expect(stylesCreator(new Date(), {} as any)).toMatchSnapshot()
  })
  it('should throw a error if a style is not provided for a predicate', () => {
    const stylesCreator = createStylesFn(
      {
        today: () => true,
        disabled: () => true,
        adjacentMonth: () => true,
        selected: () => true,
        custom: () => false,
      },
      defaultModifierStyles,
      theme
    )
    expect(() => {
      stylesCreator(new Date(), {} as any)
    }).toThrowError('You must provied a modifierStyle for predicate "custom"')
  })
})
