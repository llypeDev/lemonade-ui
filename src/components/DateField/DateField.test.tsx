import { fireEvent, render, act } from '@testing-library/react'
import React from 'react'

import { createTheme } from '../../styles'
import { Modal } from '../Modal'

import * as DateFieldModule from './DateField'
import { DateField, disableByRange } from './DateField'

// Lets pending updates, such as popper positions and debounced loads, settle inside act
const flush = () => act(async () => undefined)

describe('DateField', () => {
  it('should render correctly', async () => {
    const { container } = render(
      <DateField onChange={jest.fn()} calendarProps={{ visibleDate: new Date('2018-10-01') }} />
    )
    expect(container).toMatchSnapshot()
    await flush()
  })
  it('should render correctly when opened', async () => {
    const { container } = render(
      <DateField onChange={jest.fn()} calendarProps={{ visibleDate: new Date('2018-10-01') }} />
    )
    fireEvent.click(container.querySelector('input'))
    expect(container).toMatchSnapshot()
    await flush()
  })
  it('should render correctly when disabled', async () => {
    const { container } = render(
      <DateField onChange={jest.fn()} calendarProps={{ visibleDate: new Date('2018-10-01') }} disabled />
    )
    expect(container).toMatchSnapshot()
    await flush()
  })
  ;['', null, false, undefined].forEach((value: any) => {
    it(`should gracefully treat "${value}" as value`, async () => {
      const { container } = render(<DateField value={value} />)
      fireEvent.click(container.querySelector('input'))
      await flush()
    })
  })
  it('should open the Calendar visibleDate as the current value', async () => {
    const { container, queryByText, rerender } = render(<DateField value={new Date('2015-10-10')} />)
    fireEvent.click(container.querySelector('input'))
    expect(queryByText('Oct')).not.toBeNull()
    expect(queryByText('2015')).not.toBeNull()

    rerender(<DateField value={new Date('2020-01-01')} />)
    expect(queryByText('Oct')).toBeNull()
    expect(queryByText('2015')).toBeNull()
    expect(queryByText('Jan')).not.toBeNull()
    expect(queryByText('2020')).not.toBeNull()
    await flush()
  })
  it('should set the disabled modifier when using minDate and maxDate props', async () => {
    const spy = jest.spyOn(DateFieldModule, 'disableByRange')
    const { container } = render(
      <DateField
        calendarProps={{ visibleDate: new Date('2018-10-01') }}
        minDate={new Date('2018-10-01')}
        maxDate={new Date('2018-10-15')}
      />
    )
    fireEvent.click(container.querySelector('input'))
    expect(spy).toHaveBeenCalledWith(new Date('2018-10-01'), new Date('2018-10-15'))

    // TODO: better assert for disabled dates
    expect(container.querySelector('[data-date="2018-10-14"] span').className).toEqual(
      container.querySelector('[data-date="2018-10-15"] span').className
    )
    expect(container.querySelector('[data-date="2018-10-15"] span').className).not.toEqual(
      container.querySelector('[data-date="2018-10-16"] span').className
    )
    await flush()
  })
  it('should open calendar when clicked on input', async () => {
    const { container } = render(<DateField value={new Date('2018-10-10')} />)
    fireEvent.click(container.querySelector('input'))
    expect(container.querySelector('[data-date="2018-10-10"]')).not.toBeNull()
    fireEvent.click(container.querySelector('[data-date="2018-10-10"] span'))
    expect(container.querySelector('[data-date="2018-10-10"]')).toBeNull()
    fireEvent.click(container.querySelector('input'))
    expect(container.querySelector('[data-date="2018-10-10"]')).not.toBeNull()
    await flush()
  })
  it('should not change the time of the value when the calendar opens', async () => {
    const value = new Date(2018, 9, 10, 15, 30)
    const { container } = render(<DateField value={value} />)
    fireEvent.click(container.querySelector('input'))
    expect(value).toEqual(new Date(2018, 9, 10, 15, 30))
    await flush()
  })
  it('should keep the selected and disabled modifiers when calendarProps has other modifiers', async () => {
    const { container } = render(
      <DateField
        value={new Date(2018, 9, 10)}
        minDate={new Date(2018, 9, 5)}
        calendarProps={{
          modifiers: { holiday: (day: Date) => day.getDate() === 12 },
          modifierStyles: { holiday: () => ({ color: 'red' }) },
        }}
      />
    )
    fireEvent.click(container.querySelector('input'))
    const selectedBackground = createTheme().pallete.primary.main
    expect(container.querySelector('[data-date="2018-10-10"] span')).toHaveStyleRule('background', selectedBackground)
    expect(container.querySelector('[data-date="2018-10-04"] span')).toHaveAttribute('aria-disabled', 'true')
    expect(container.querySelector('[data-date="2018-10-12"] span')).toHaveStyleRule('color', 'red')
    await flush()
  })
  it('should let calendarProps disable more days, but not enable those out of the range', async () => {
    const { container } = render(
      <DateField
        value={new Date(2018, 9, 10)}
        minDate={new Date(2018, 9, 5)}
        calendarProps={{ modifiers: { disabled: (day: Date) => day.getDate() === 12 } }}
      />
    )
    fireEvent.click(container.querySelector('input'))
    expect(container.querySelector('[data-date="2018-10-04"] span')).toHaveAttribute('aria-disabled', 'true')
    expect(container.querySelector('[data-date="2018-10-12"] span')).toHaveAttribute('aria-disabled', 'true')
    expect(container.querySelector('[data-date="2018-10-11"] span')).not.toHaveAttribute('aria-disabled')
    await flush()
  })
  it('should expose the placement of the popper, which popperProps can change', async () => {
    const { container, rerender } = render(<DateField value={new Date(2018, 9, 10)} />)
    fireEvent.click(container.querySelector('input'))
    await flush()
    expect(container.querySelector('[data-placement]')).toHaveAttribute('data-placement', 'bottom-start')

    rerender(<DateField value={new Date(2018, 9, 10)} popperProps={{ placement: 'top-end' } as any} />)
    await flush()
    expect(container.querySelector('[data-placement]')).toHaveAttribute('data-placement', 'top-end')
  })
})

const dayButton = (root: Element, date: string) =>
  root.querySelector<HTMLElement>(`td[data-date="${date}"] [role="button"]`)

// The elements that Tab goes through, in order
const tabOrder = (root: Element) =>
  Array.from(root.querySelectorAll<HTMLElement>('input, button, [tabindex]')).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1'
  )

describe('DateField opening, closing and keyboard', () => {
  it('should not open the calendar when the input gets the focus', async () => {
    const { container } = render(<DateField value={new Date(2018, 9, 10)} />)
    act(() => container.querySelector('input').focus())
    expect(container.querySelector('[data-date]')).toBeNull()
    await flush()
  })

  it('should open the calendar on a click on the input and on the calendar button', async () => {
    const { container, getByRole } = render(<DateField value={new Date(2018, 9, 10)} />)
    const input = container.querySelector('input')

    fireEvent.click(input)
    expect(dayButton(container, '2018-10-10')).not.toBeNull()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(dayButton(container, '2018-10-10')).toBeNull()

    fireEvent.click(getByRole('button', { name: 'Open calendar' }))
    expect(dayButton(container, '2018-10-10')).not.toBeNull()
    await flush()
  })

  it('should close the calendar with Escape and keep the focus in the input', async () => {
    const { container } = render(<DateField value={new Date(2018, 9, 10)} />)
    const input = container.querySelector('input')
    act(() => input.focus())
    fireEvent.click(input)

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(container.querySelector('[data-date]')).toBeNull()
    expect(input).toHaveFocus()
    await flush()
  })

  it('should give the focus back to the input when Escape is pressed on the calendar button', async () => {
    const { container, getByRole } = render(<DateField value={new Date(2018, 9, 10)} />)
    const button = getByRole('button', { name: 'Open calendar' })
    act(() => button.focus())
    fireEvent.click(button)

    fireEvent.keyDown(button, { key: 'Escape' })
    expect(container.querySelector('[data-date]')).toBeNull()
    expect(container.querySelector('input')).toHaveFocus()
    await flush()
  })

  it('should open with Alt+ArrowDown, move the focus to the selected day and give it back to the input with Escape', async () => {
    const { container } = render(<DateField value={new Date(2018, 9, 10)} />)
    const input = container.querySelector('input')
    act(() => input.focus())

    expect(fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })).toBe(false)
    expect(dayButton(container, '2018-10-10')).toHaveFocus()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(container.querySelector('[data-date]')).toBeNull()
    expect(input).toHaveFocus()
    await flush()
  })

  it('should not scroll the page when the calendar that just opened gets the focus', async () => {
    // Popper puts the popup in its place after it mounts, so it may still be at the top of the page
    const focus = jest.spyOn(HTMLElement.prototype, 'focus')
    const { container } = render(<DateField value={new Date(2018, 9, 10)} />)
    const input = container.querySelector('input')
    act(() => input.focus())

    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true })
    expect(focus.mock.instances[focus.mock.instances.length - 1]).toBe(dayButton(container, '2018-10-10'))
    focus.mockRestore()
    await flush()
  })

  it('should show the month of the value again when the calendar opens after showing another month', async () => {
    const { container, getByTitle } = render(<DateField value={new Date(2018, 9, 10)} />)
    const input = container.querySelector('input')
    act(() => input.focus())

    fireEvent.click(input)
    fireEvent.click(getByTitle('Next month'))
    expect(dayButton(container, '2018-11-10')).not.toBeNull()
    fireEvent.keyDown(input, { key: 'Escape' })

    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    expect(dayButton(container, '2018-10-10')).toHaveFocus()
    await flush()
  })

  it('should move the focus into the open calendar with Alt+ArrowDown', async () => {
    const { container } = render(<DateField value={new Date(2018, 9, 10)} />)
    const input = container.querySelector('input')
    act(() => input.focus())
    fireEvent.click(input)
    expect(input).toHaveFocus()

    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    expect(dayButton(container, '2018-10-10')).toHaveFocus()
    await flush()
  })

  it('should pick a day with the keyboard, close the calendar and keep the focus in the input', async () => {
    const change = jest.fn()
    const { container } = render(<DateField value={new Date(2018, 9, 10)} onChange={change} />)
    const input = container.querySelector('input')
    act(() => input.focus())

    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })

    expect(change).toHaveBeenCalledWith(new Date(2018, 9, 11))
    expect(container.querySelector('[data-date]')).toBeNull()
    expect(input).toHaveFocus()
    await flush()
  })

  it('should not pick a day out of minDate and maxDate with the keyboard', async () => {
    const change = jest.fn()
    const { container } = render(
      <DateField value={new Date(2018, 9, 5)} minDate={new Date(2018, 9, 5)} onChange={change} />
    )
    const input = container.querySelector('input')
    act(() => input.focus())

    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
    expect(dayButton(container, '2018-10-04')).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })

    expect(change).not.toHaveBeenCalled()
    expect(dayButton(container, '2018-10-04')).toHaveFocus()
    await flush()
  })

  it('should put the calendar buttons and one day in the tab order after the input, and stay open there', async () => {
    const { container, getByTitle } = render(<DateField value={new Date(2018, 9, 10)} />)
    const input = container.querySelector('input')
    act(() => input.focus())
    fireEvent.click(input)

    expect(tabOrder(container)).toEqual([
      input,
      getByTitle('Previous month'),
      getByTitle('Next month'),
      getByTitle('Previous year'),
      getByTitle('Next year'),
      dayButton(container, '2018-10-10'),
    ])

    // As Tab does
    act(() => getByTitle('Previous month').focus())
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)))
    expect(dayButton(container, '2018-10-10')).not.toBeNull()
  })

  it('should close only the calendar with Escape inside a modal', async () => {
    const close = jest.fn()
    render(
      <Modal open onClose={close}>
        <DateField value={new Date(2018, 9, 10)} />
      </Modal>
    )
    const input = document.querySelector('input')
    fireEvent.click(input)
    expect(dayButton(document.body, '2018-10-10')).not.toBeNull()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(dayButton(document.body, '2018-10-10')).toBeNull()
    expect(close).not.toHaveBeenCalled()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(1)
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
