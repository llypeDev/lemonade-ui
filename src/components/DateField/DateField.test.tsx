import { fireEvent, render, act } from '@testing-library/react'
import React from 'react'

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
    fireEvent.focus(container.querySelector('input'))
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
      fireEvent.focus(container.querySelector('input'))
      await flush()
    })
  })
  it('should open the Calendar visibleDate as the current value', async () => {
    const { container, queryByText, rerender } = render(<DateField value={new Date('2015-10-10')} />)
    fireEvent.focus(container.querySelector('input'))
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
    fireEvent.focus(container.querySelector('input'))
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
    fireEvent.focus(container.querySelector('input'))
    expect(container.querySelector('[data-date="2018-10-10"]')).not.toBeNull()
    fireEvent.click(container.querySelector('[data-date="2018-10-10"] span'))
    expect(container.querySelector('[data-date="2018-10-10"]')).toBeNull()
    fireEvent.click(container.querySelector('input'))
    expect(container.querySelector('[data-date="2018-10-10"]')).not.toBeNull()
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
