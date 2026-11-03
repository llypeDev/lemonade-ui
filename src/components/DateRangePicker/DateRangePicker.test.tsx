import { render, fireEvent, waitFor, act } from '@testing-library/react'
import React, { useState } from 'react'

import * as DateFieldModule from '../DateField/DateField'
import * as DateRangePickerModule from '../DateRangePicker/DateRangePicker'
import { disableByRange } from '../DateField/DateField'

import { DateRangePicker, DateRangePickerProps, disableByWeekRange } from './DateRangePicker'
import { DateRange } from './BaseDateRangeInput'

// Lets pending updates, such as popper positions and debounced loads, settle inside act
const flush = () => act(async () => undefined)

// Focuses an input, which tells the calendar which date it picks, and clicks it, which opens the calendar
const openFrom = (input: Element) => {
  fireEvent.focus(input)
  fireEvent.click(input)
}

describe('DateRangePicker', () => {
  describe('render', () => {
    it('should render correctly', async () => {
      const { container } = render(<DateRangePicker />)
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly when opened', async () => {
      const { container } = render(<DateRangePicker calendarProps={{ visibleDate: new Date('2018-10-01') }} />)
      openFrom(container.querySelector('input'))
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly when disabled', async () => {
      const { container } = render(<DateRangePicker disabled />)
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly when invalid', async () => {
      const { container } = render(<DateRangePicker invalid />)
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctyly when onlyWeeks', async () => {
      const { container } = render(<DateRangePicker onlyWeeks />)
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should call onFocus and onBlur when one of the inputs has and lose focus', async () => {
      const focus = jest.fn()
      const blur = jest.fn()
      const { container } = render(<DateRangePicker onFocus={focus} onBlur={blur} />)
      const input = container.querySelectorAll('input')[0]
      fireEvent.focus(input)
      fireEvent.blur(input)

      await waitFor(() => jest.useFakeTimers())

      expect(focus).toHaveBeenCalledTimes(1)
      expect(blur).toHaveBeenCalledTimes(1)
      await flush()
    })

    it('should show calendar correctly when inputs are cleaned', async () => {
      const { container } = render(<DateRangePicker calendarProps={{ visibleDate: new Date('2018-10-01') }} />)

      openFrom(container.querySelector('input'))
      expect(container.querySelector('[data-date="2018-10-01"] span')).toMatchSnapshot()
      await flush()
    })

    it('should show calendar correctly when only startDate is defined and is focused', async () => {
      const { container } = render(
        <DateRangePicker value={{ startDate: new Date('2018-10-01'), endDate: undefined }} />
      )
      const inputs = container.querySelectorAll('input')

      openFrom(inputs[0])
      expect(container.querySelector('[data-date="2018-10-01"] span')).toMatchSnapshot()
      expect(container.querySelector('[data-date="2018-11-15"] span')).toMatchSnapshot()
      await flush()
    })

    it('should show calendar correctly when only endDate is defined and is focused', async () => {
      const { container } = render(
        <DateRangePicker value={{ startDate: undefined, endDate: new Date('2018-10-01') }} />
      )
      const inputs = container.querySelectorAll('input')

      openFrom(inputs[1])
      expect(container.querySelector('[data-date="2018-10-01"] span')).toMatchSnapshot()
      expect(container.querySelector('[data-date="2018-11-15"] span')).toMatchSnapshot()
      await flush()
    })

    it('should show calendar correctly when startDate and endDate are defined and startDate is focused', async () => {
      const { container } = render(
        <DateRangePicker value={{ startDate: new Date('2018-10-01'), endDate: new Date('2018-11-15') }} />
      )
      const inputs = container.querySelectorAll('input')

      openFrom(inputs[0])
      expect(container.querySelector('[data-date="2018-10-01"] span')).toMatchSnapshot()
      expect(container.querySelector('[data-date="2018-11-15"] span')).toMatchSnapshot()
      await flush()
    })

    it('should show calendar correctly when startDate and endDate are defined and endDate is focused', async () => {
      const { container } = render(
        <DateRangePicker value={{ startDate: new Date('2018-10-01'), endDate: new Date('2018-11-15') }} />
      )
      const inputs = container.querySelectorAll('input')

      openFrom(inputs[1])
      expect(container.querySelector('[data-date="2018-10-01"] span')).toMatchSnapshot()
      expect(container.querySelector('[data-date="2018-11-15"] span')).toMatchSnapshot()
      await flush()
    })
  })

  describe('props', () => {
    it('should render an invalid date as an empty input and open the calendar on the current month', async () => {
      const { container } = render(<DateRangePicker value={{ startDate: new Date('invalid'), endDate: undefined }} />)
      const inputs = container.querySelectorAll('input')
      expect(inputs[0].value).toEqual('')

      openFrom(inputs[0])
      const today = new Date()
      const todayCell = `[data-date="${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${(
        '0' + today.getDate()
      ).slice(-2)}"]`
      expect(container.querySelector(todayCell)).not.toBeNull()
      await flush()
    })

    it('should keep the disabled modifier when calendarProps has other modifiers', async () => {
      const { container } = render(
        <DateRangePicker
          minDate={new Date(2018, 9, 5)}
          calendarProps={{
            visibleDate: new Date(2018, 9, 1),
            modifiers: { holiday: (day: Date) => day.getDate() === 12 },
            modifierStyles: { holiday: () => ({ color: 'red' }) },
          }}
        />
      )
      openFrom(container.querySelector('input'))
      expect(container.querySelector('[data-date="2018-10-04"] span')).toHaveAttribute('aria-disabled', 'true')
      expect(container.querySelector('[data-date="2018-10-12"] span')).toHaveStyleRule('color', 'red')
      await flush()
    })

    it('should give the inputs distinct ids, the label pointing to the first one', async () => {
      const { container, getByLabelText } = render(<DateRangePicker id='period' label='Period' />)
      const inputs = container.querySelectorAll('input')
      expect(container.querySelectorAll('#period')).toHaveLength(1)
      expect(getByLabelText('Period')).toBe(inputs[0])
      expect(inputs[1]).toHaveAttribute('id', 'period-end')
      await flush()
    })

    it('should expose the placement of the popper, which popperProps can change', async () => {
      const { container, rerender } = render(<DateRangePicker />)
      openFrom(container.querySelector('input'))
      await flush()
      expect(container.querySelector('[data-placement]')).toHaveAttribute('data-placement', 'bottom')

      rerender(<DateRangePicker popperProps={{ placement: 'top-end' } as any} />)
      await flush()
      expect(container.querySelector('[data-placement]')).toHaveAttribute('data-placement', 'top-end')
    })
  })

  describe('onChange calls', () => {
    describe('typing on the inputs', () => {
      it('should call onChange when a date is typed (in startDate or endDate)', async () => {
        const change = jest.fn()
        const { container } = render(
          <DateRangePicker onChange={change} calendarProps={{ visibleDate: new Date('2018-10-01') }} />
        )
        const inputs = container.querySelectorAll('input')

        fireEvent.change(inputs[0], { target: { value: '01/10/2018' } })
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-10-01'),
          endDate: undefined,
        } as DateRange)

        fireEvent.change(inputs[1], { target: { value: '01/11/2018' } })
        expect(change).toHaveBeenLastCalledWith({
          startDate: undefined,
          endDate: new Date('2018-11-01'),
        } as DateRange)
        await flush()
      })
    })

    describe('clicking on the calendar', () => {
      it('should call onchange with only startDate defined when startDate input has focus and a date is select on calendar', async () => {
        const change = jest.fn()
        const { container, getByText } = render(
          <DateRangePicker onChange={change} calendarProps={{ visibleDate: new Date('2018-10-01') }} />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[0])
        fireEvent.click(getByText('05'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-10-05'),
          endDate: undefined,
        } as DateRange)
        await flush()
      })
    })

    describe('clicking on the calendar', () => {
      it('should call onchange with only endDate defined when endDate input has focus and a date is select on calendar', async () => {
        const change = jest.fn()
        const { container, getByText } = render(
          <DateRangePicker onChange={change} calendarProps={{ visibleDate: new Date('2018-10-01') }} />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[1])
        fireEvent.click(getByText('05'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: undefined,
          endDate: new Date('2018-10-05'),
        } as DateRange)
        await flush()
      })

      it('should call onchange with only startDate defined when startDate input has focus and the selected date is after endDate value', async () => {
        const change = jest.fn()
        const { container, getByText, getByTitle } = render(
          <DateRangePicker
            onChange={change}
            value={{ startDate: new Date('2018-10-01'), endDate: new Date('2018-11-15') }}
          />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[0])
        fireEvent.click(getByTitle('Next month'))
        fireEvent.click(getByText('20'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-11-20'),
          endDate: undefined,
        } as DateRange)
        await flush()
      })

      it('should call onchange with only startDate defined when endDate input has focus and the selected date is before startDate value', async () => {
        const change = jest.fn()
        const { container, getByText, getByTitle } = render(
          <DateRangePicker
            onChange={change}
            value={{ startDate: new Date('2018-10-10'), endDate: new Date('2018-11-15') }}
          />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[1])
        fireEvent.click(getByTitle('Previous month'))
        fireEvent.click(getByText('05'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-10-05'),
          endDate: undefined,
        } as DateRange)
        await flush()
      })

      it('should call onchange with a new endDate when endDate input has focus and the selected date is after his value', async () => {
        const change = jest.fn()
        const { container, getByText } = render(
          <DateRangePicker
            onChange={change}
            value={{ startDate: new Date('2018-10-01'), endDate: new Date('2018-11-15') }}
          />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[1])
        fireEvent.click(getByText('20'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-10-01'),
          endDate: new Date('2018-11-20'),
        } as DateRange)
        await flush()
      })

      it('should call onchange with a new startDate when startDate input has focus and the selected date is before his value', async () => {
        const change = jest.fn()
        const { container, getByText } = render(
          <DateRangePicker
            onChange={change}
            value={{ startDate: new Date('2018-10-10'), endDate: new Date('2018-11-15') }}
          />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[0])
        fireEvent.click(getByText('05'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-10-05'),
          endDate: new Date('2018-11-15'),
        } as DateRange)
        await flush()
      })

      it('should call onchange with switched dates when endDate input has focus and the selected date is before startDate', async () => {
        const change = jest.fn()
        const { container, getByText } = render(
          <DateRangePicker
            onChange={change}
            value={{ startDate: new Date('2018-10-10'), endDate: undefined }}
            calendarProps={{ visibleDate: new Date('2018-09-15') }}
          />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[1])
        fireEvent.click(getByText('10'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-09-10'),
          endDate: new Date('2018-10-10'),
        } as DateRange)
        await flush()
      })

      it('should call onchange with switched dates when startDate input has focus and the selected date is after endDate', async () => {
        const change = jest.fn()
        const { container, getByText } = render(
          <DateRangePicker
            onChange={change}
            value={{ startDate: undefined, endDate: new Date('2018-10-10') }}
            calendarProps={{ visibleDate: new Date('2018-09-15') }}
          />
        )
        const inputs = container.querySelectorAll('input')

        openFrom(inputs[0])
        fireEvent.click(getByText('10'))
        expect(change).toHaveBeenLastCalledWith({
          startDate: new Date('2018-09-10'),
          endDate: new Date('2018-10-10'),
        } as DateRange)
        await flush()
      })
    })
  })
})

const dayButton = (root: Element, date: string) =>
  root.querySelector<HTMLElement>(`td[data-date="${date}"] [role="button"]`)

// The elements that Tab goes through, in order
const tabOrder = (root: Element) =>
  Array.from(root.querySelectorAll<HTMLElement>('input, button, [tabindex]')).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1'
  )

const ControlledDateRangePicker = (props: DateRangePickerProps & { initial?: DateRange }) => {
  const { initial, onChange, ...rest } = props
  const [value, setValue] = useState<DateRange>(initial)
  return (
    <DateRangePicker
      {...rest}
      value={value}
      onChange={(range) => {
        setValue(range)
        onChange && onChange(range)
      }}
    />
  )
}

describe('DateRangePicker opening, closing and keyboard', () => {
  const range = { startDate: new Date(2018, 9, 1), endDate: new Date(2018, 9, 15) }

  it('should not open the calendar when an input gets the focus', async () => {
    const { container } = render(<DateRangePicker value={range} />)
    const inputs = container.querySelectorAll('input')

    act(() => inputs[0].focus())
    act(() => inputs[1].focus())
    expect(container.querySelector('[data-date]')).toBeNull()
    await flush()
  })

  it('should open the calendar on a click on an input and on the calendar button', async () => {
    const { container, getByRole } = render(<DateRangePicker value={range} />)
    const inputs = container.querySelectorAll('input')

    fireEvent.click(inputs[1])
    expect(dayButton(container, '2018-10-15')).not.toBeNull()

    fireEvent.keyDown(inputs[1], { key: 'Escape' })
    expect(dayButton(container, '2018-10-15')).toBeNull()

    fireEvent.click(getByRole('button', { name: 'Open calendar' }))
    expect(dayButton(container, '2018-10-15')).not.toBeNull()
    // As before, the button moves the focus to the first input
    expect(inputs[0]).toHaveFocus()
    await flush()
  })

  it('should open with Alt+ArrowDown on the day of the focused input and give the focus back with Escape', async () => {
    const { container } = render(<DateRangePicker value={range} />)
    const inputs = container.querySelectorAll('input')
    act(() => inputs[1].focus())

    expect(fireEvent.keyDown(inputs[1], { key: 'ArrowDown', altKey: true })).toBe(false)
    expect(dayButton(container, '2018-10-15')).toHaveFocus()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(container.querySelector('[data-date]')).toBeNull()
    expect(inputs[1]).toHaveFocus()
    await flush()
  })

  it('should pick the start and then the end with the keyboard', async () => {
    const change = jest.fn()
    const { container } = render(
      <ControlledDateRangePicker initial={{ startDate: new Date(2018, 9, 10) }} onChange={change} />
    )
    const inputs = container.querySelectorAll('input')
    act(() => inputs[0].focus())

    fireEvent.keyDown(inputs[0], { key: 'ArrowDown', altKey: true })
    expect(dayButton(container, '2018-10-10')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    expect(change).toHaveBeenLastCalledWith({ startDate: new Date(2018, 9, 9), endDate: undefined })
    // The end input gets the focus, and the calendar stays open
    expect(inputs[1]).toHaveFocus()
    expect(dayButton(container, '2018-10-09')).not.toBeNull()

    fireEvent.keyDown(inputs[1], { key: 'ArrowDown', altKey: true })
    expect(dayButton(container, '2018-10-09')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    fireEvent.keyDown(document.activeElement, { key: ' ' })
    expect(change).toHaveBeenLastCalledWith({ startDate: new Date(2018, 9, 9), endDate: new Date(2018, 9, 16) })
    expect(inputs[1]).toHaveFocus()
    await flush()
  })

  it('should show the month of the value again when the calendar opens after showing another month', async () => {
    const { container, getByTitle } = render(<DateRangePicker value={range} />)
    const inputs = container.querySelectorAll('input')
    act(() => inputs[0].focus())

    fireEvent.click(inputs[0])
    fireEvent.click(getByTitle('Next month'))
    expect(dayButton(container, '2018-11-01')).not.toBeNull()
    fireEvent.keyDown(inputs[0], { key: 'Escape' })

    fireEvent.keyDown(inputs[0], { key: 'ArrowDown', altKey: true })
    expect(dayButton(container, '2018-10-01')).toHaveFocus()
    await flush()
  })

  it('should put the calendar buttons and one day in the tab order after the inputs', async () => {
    const { container, getByTitle } = render(<DateRangePicker value={range} />)
    const inputs = container.querySelectorAll('input')
    openFrom(inputs[0])

    expect(tabOrder(container)).toEqual([
      inputs[0],
      inputs[1],
      getByTitle('Previous month'),
      getByTitle('Next month'),
      getByTitle('Previous year'),
      getByTitle('Next year'),
      dayButton(container, '2018-10-01'),
    ])
    await flush()
  })

  it('should put a day of the selected weeks in the tab order when only weeks are picked', async () => {
    const { container } = render(
      <DateRangePicker onlyWeeks value={{ startDate: new Date(2020, 11, 13), endDate: new Date(2021, 0, 9) }} />
    )
    const inputs = container.querySelectorAll('input')
    act(() => inputs[0].focus())

    fireEvent.keyDown(inputs[0], { key: 'ArrowDown', altKey: true })
    expect(document.activeElement).toHaveTextContent('13')
    expect(container.querySelector('[data-week="13/12/2020-19/12/2020"]')).toContainElement(
      document.activeElement as HTMLElement
    )
    await flush()
  })
})

describe('test min and max', () => {
  it('should call the disableByRange when not choose onlyWeeks', async () => {
    const spy = jest.spyOn(DateFieldModule, 'disableByRange')
    const { container } = render(
      <DateRangePicker
        calendarProps={{ visibleDate: new Date('2018-10-01') }}
        minDate={new Date('2018-10-01')}
        maxDate={new Date('2018-10-15')}
      />
    )
    openFrom(container.querySelector('input'))
    expect(spy).toHaveBeenCalledWith(new Date('2018-10-01'), new Date('2018-10-15'))
    await flush()
  })
  it('should call the disableByWeekRange when choose onlyWeeks', async () => {
    const spy = jest.spyOn(DateRangePickerModule, 'disableByWeekRange')
    const { container } = render(
      <DateRangePicker
        calendarProps={{ visibleDate: new Date('2021-01-03') }}
        minDate={new Date('2021-01-03')}
        maxDate={new Date('2021-01-16')}
        onlyWeeks
      />
    )
    openFrom(container.querySelector('input'))
    expect(spy).toHaveBeenCalledWith(new Date('2021-01-03'), new Date('2021-01-16'))
    await flush()
  })
  it('should set the disabled modifier when using minDate and maxDate props', async () => {
    const spy = jest.spyOn(DateFieldModule, 'disableByRange')
    const { container } = render(
      <DateRangePicker
        calendarProps={{ visibleDate: new Date('2018-10-01') }}
        minDate={new Date('2018-10-01')}
        maxDate={new Date('2018-10-15')}
      />
    )

    openFrom(container.querySelector('input'))
    expect(spy).toHaveBeenCalledWith(new Date('2018-10-01'), new Date('2018-10-15'))

    expect(container.querySelector('[data-date="2018-10-14"] span').className).toEqual(
      container.querySelector('[data-date="2018-10-15"] span').className
    )
    expect(container.querySelector('[data-date="2018-10-15"] span').className).not.toEqual(
      container.querySelector('[data-date="2018-10-16"] span').className
    )
    await flush()
  })
})

describe('disableByRange', () => {
  it('should return a predicate that disables date by range', async () => {
    const isDisabled = disableByRange(new Date('2018-10-10'), new Date('2018-10-15'))
    expect(isDisabled(new Date('2018-10-13'))).toBeFalsy()
    expect(isDisabled(new Date('2018-10-10'))).toBeFalsy()
    expect(isDisabled(new Date('2018-10-09'))).toBeTruthy()
    expect(isDisabled(new Date('2018-10-15'))).toBeFalsy()
    expect(isDisabled(new Date('2018-10-16'))).toBeTruthy()
    await flush()
  })
  it('should return a predicate that disables date by minDate', async () => {
    const isDisabled = disableByRange(new Date('2018-10-10'), null)
    expect(isDisabled(new Date('2200-10-13'))).toBeFalsy()
    expect(isDisabled(new Date('2018-10-10'))).toBeFalsy()
    expect(isDisabled(new Date('2018-10-09'))).toBeTruthy()
    expect(isDisabled(new Date('1970-10-09'))).toBeTruthy()
    await flush()
  })
  it('should return a predicate that disables date by maxDate', async () => {
    const isDisabled = disableByRange(null, new Date('2018-10-15'))
    expect(isDisabled(new Date('2200-10-13'))).toBeTruthy()
    expect(isDisabled(new Date('2018-10-16'))).toBeTruthy()
    expect(isDisabled(new Date('2018-10-09'))).toBeFalsy()
    expect(isDisabled(new Date('1970-10-09'))).toBeFalsy()
    await flush()
  })
  it('should disconsider time when comparing maxDate and minDate', async () => {
    const isDisabled = disableByRange(new Date('2018-10-01T20:59:00'), new Date('2018-10-01T20:59:30'))
    expect(isDisabled(new Date('2018-10-01T12:00:00'))).toBeFalsy()
    expect(isDisabled(new Date('2018-10-01T23:00:00'))).toBeFalsy()
    await flush()
  })
})

describe('disabledByWeekRange', () => {
  it('should return a predicate that disables by range', async () => {
    const isDisabled = disableByWeekRange(new Date('2020-12-27'), new Date('2021-01-16'))
    expect(isDisabled({ start: new Date('2020-12-27'), end: new Date('2021-01-02') })).toBeFalsy()
    expect(isDisabled({ start: new Date('2021-01-03'), end: new Date('2021-01-08') })).toBeFalsy()
    expect(isDisabled({ start: new Date('2020-12-20'), end: new Date('2020-12-26') })).toBeTruthy()
    expect(isDisabled({ start: new Date('2021-01-17'), end: new Date('2021-01-23') })).toBeTruthy()
    await flush()
  })
  it('should return a predicate that disables date by minDate', async () => {
    const isDisabled = disableByWeekRange(new Date('2020-12-27'), null)
    expect(isDisabled({ start: new Date('2020-12-27'), end: new Date('2021-01-02') })).toBeFalsy()
    expect(isDisabled({ start: new Date('2021-01-03'), end: new Date('2021-01-08') })).toBeFalsy()
    expect(isDisabled({ start: new Date('2020-12-20'), end: new Date('2020-12-26') })).toBeTruthy()
    expect(isDisabled({ start: new Date('2020-12-13'), end: new Date('2020-12-19') })).toBeTruthy()
    await flush()
  })
  it('should return a predicate that disables date by maxDate', async () => {
    const isDisabled = disableByWeekRange(null, new Date('2021-01-16'))
    expect(isDisabled({ start: new Date('2020-12-27'), end: new Date('2021-01-02') })).toBeFalsy()
    expect(isDisabled({ start: new Date('2021-01-03'), end: new Date('2021-01-08') })).toBeFalsy()
    expect(isDisabled({ start: new Date('2021-01-17'), end: new Date('2021-01-23') })).toBeTruthy()
    expect(isDisabled({ start: new Date('2021-02-07'), end: new Date('2021-02-13') })).toBeTruthy()
    await flush()
  })
  it('should disconsider time when comparing maxDate and minDate', async () => {
    const isDisabled = disableByWeekRange(new Date('2020-12-27T20:59:00'), new Date('2021-01-16T20:59:30'))
    expect(isDisabled({ start: new Date('2020-12-27T12:00:00'), end: new Date('2021-01-02T12:00:00') })).toBeFalsy()
    expect(isDisabled({ start: new Date('2021-01-10T12:00:00'), end: new Date('2021-01-16T12:00:00') })).toBeFalsy()
    await flush()
  })
})
