import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBr from '../../i18n/locales/pt-BR'

import { MonthControl } from './MonthControl'

it('should render correctly', () => {
  const { container } = render(<MonthControl visibleDate={new Date('2018-10-26')} onChange={jest.fn()} />)
  expect(container).toMatchSnapshot()
})

it('should call onChange function with next month when clicked on next button', () => {
  const change = jest.fn()
  const { getByTitle } = render(<MonthControl visibleDate={new Date('2018-10-26')} onChange={change} />)
  const nextButton = getByTitle('Next month')

  expect(change).not.toHaveBeenCalled()
  fireEvent.click(nextButton)
  expect(change).toHaveBeenCalledWith(new Date(2018, 10, 1))
})

it('should call onChange function with previous month when clicked on prev button', () => {
  const change = jest.fn()
  const { getByTitle } = render(<MonthControl visibleDate={new Date('2018-10-26')} onChange={change} />)
  const prevButton = getByTitle('Previous month')

  expect(change).not.toHaveBeenCalled()
  fireEvent.click(prevButton)
  expect(change).toHaveBeenCalledWith(new Date(2018, 8, 1))
})

it('should go to the next and previous months from the end of a month', () => {
  const change = jest.fn()
  const { getByTitle, rerender } = render(<MonthControl visibleDate={new Date(2019, 0, 31)} onChange={change} />)

  // January 31 + 1 month would roll over to March
  fireEvent.click(getByTitle('Next month'))
  expect(change).toHaveBeenLastCalledWith(new Date(2019, 1, 1))

  // March 31 - 1 month would roll over to March again
  rerender(<MonthControl visibleDate={new Date(2019, 2, 31)} onChange={change} />)
  fireEvent.click(getByTitle('Previous month'))
  expect(change).toHaveBeenLastCalledWith(new Date(2019, 1, 1))
})

it('should allow message customization via locale context', () => {
  const { container } = render(
    <LocaleContext.Provider value={ptBr}>
      <MonthControl />
    </LocaleContext.Provider>
  )
  expect(container.querySelectorAll('button')[0].getAttribute('title')).toEqual(ptBr.calendar.previousMonth)
  expect(container.querySelectorAll('button')[1].getAttribute('title')).toEqual(ptBr.calendar.nextMonth)
})
