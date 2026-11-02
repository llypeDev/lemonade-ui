import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBr from '../../i18n/locales/pt-BR'

import { YearControl } from './YearControl'

it('should render correctly', () => {
  const { container } = render(<YearControl visibleDate={new Date('2018-10-26')} onChange={jest.fn()} />)
  expect(container).toMatchSnapshot()
})

it('should call onChange function with next year when clicked on next button', () => {
  const change = jest.fn()
  const { getByTitle } = render(<YearControl visibleDate={new Date('2018-10-26')} onChange={change} />)
  const nextButton = getByTitle('Next year')

  expect(change).not.toHaveBeenCalled()
  fireEvent.click(nextButton)
  expect(change).toHaveBeenCalledWith(new Date(2019, 9, 1))
})

it('should call onChange function with previous year when clicked on prev button', () => {
  const change = jest.fn()
  const { getByTitle } = render(<YearControl visibleDate={new Date('2018-10-26')} onChange={change} />)
  const prevButton = getByTitle('Previous year')

  expect(change).not.toHaveBeenCalled()
  fireEvent.click(prevButton)
  expect(change).toHaveBeenCalledWith(new Date(2017, 9, 1))
})

it('should keep the month when the year changes from February 29', () => {
  const change = jest.fn()
  const { getByTitle } = render(<YearControl visibleDate={new Date(2028, 1, 29)} onChange={change} />)

  // February 29, 2028 + 1 year would roll over to March 2029
  fireEvent.click(getByTitle('Next year'))
  expect(change).toHaveBeenLastCalledWith(new Date(2029, 1, 1))

  fireEvent.click(getByTitle('Previous year'))
  expect(change).toHaveBeenLastCalledWith(new Date(2027, 1, 1))
})

it('should allow message customization via locale context', () => {
  const { container } = render(
    <LocaleContext.Provider value={ptBr}>
      <YearControl />
    </LocaleContext.Provider>
  )
  expect(container.querySelectorAll('button')[0].getAttribute('title')).toEqual(ptBr.calendar.previousYear)
  expect(container.querySelectorAll('button')[1].getAttribute('title')).toEqual(ptBr.calendar.nextYear)
})
