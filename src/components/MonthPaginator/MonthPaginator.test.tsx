import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { getUserLocale, getMonthNames } from '../../util/locale'
import { MonthPaginator } from './MonthPaginator'

const now = new Date()

function renderMonthYear(month, year) {
  const date = new Date(year, month, 1, 0, 0, 0, 0)
  const monthFormatter = new Intl.DateTimeFormat(getUserLocale(), { month: 'short' })
  const yearFormatter = new Intl.DateTimeFormat(getUserLocale(), { year: 'numeric' })
  return `${monthFormatter.format(date)} - ${yearFormatter.format(date)}`
}

describe('MonthPaginator', () => {
  it('should render correctly with month and year', () => {
    const visibleDate = new Date('2019-01-31')
    const { container } = render(<MonthPaginator month={visibleDate.getMonth()} year={visibleDate.getFullYear()} />)
    expect(container).toMatchSnapshot()
  })

  it('should render correctly with ghost', () => {
    const visibleDate = new Date('2019-01-31')
    const { container } = render(
      <MonthPaginator ghost={true} month={visibleDate.getMonth()} year={visibleDate.getFullYear()} />
    )
    expect(container).toMatchSnapshot()
  })

  it('should change the visible month on "Previous month" button click', () => {
    const { getByTitle, getAllByText } = render(<MonthPaginator month={now.getMonth()} year={now.getFullYear()} />)
    fireEvent.click(getByTitle('Previous month'))
    const expectedMonth = now.getMonth() - 1
    expect(getAllByText(renderMonthYear(expectedMonth, now.getFullYear()))).toHaveLength(1)
  })

  it('should change the visible month on "Next month" button click', () => {
    const { getByTitle, getAllByText } = render(<MonthPaginator month={now.getMonth()} year={now.getFullYear()} />)
    fireEvent.click(getByTitle('Next month'))
    const expectedMonth = now.getMonth() + 1
    expect(getAllByText(renderMonthYear(expectedMonth, now.getFullYear()))).toHaveLength(1)
  })

  it('should call "onChange" when a month is selected and "onChange" is set', () => {
    const onChange = jest.fn()
    const { getByText, getByTestId } = render(
      <MonthPaginator month={now.getMonth()} year={now.getFullYear()} onChange={onChange} />
    )
    fireEvent.click(getByTestId('MonthPaginator.ShowMonthsButton'))
    fireEvent.click(getByText('Jan'))
    expect(onChange).toHaveBeenCalledWith({ month: 0, year: now.getFullYear() })
  })

  it('should disable arrow buttons when, and only when, the month picker is visible', () => {
    const onChange = jest.fn()
    const { getByTitle, getByTestId, getByText } = render(
      <MonthPaginator month={now.getMonth()} year={now.getFullYear()} onChange={onChange} />
    )
    const openButton = getByTestId('MonthPaginator.ShowMonthsButton')
    const nextButton = getByTitle('Next month')
    const prevButton = getByTitle('Previous month')

    expect(nextButton.hasAttribute('disabled')).toBeFalsy()
    expect(prevButton.hasAttribute('disabled')).toBeFalsy()
    expect(openButton.hasAttribute('disabled')).toBeFalsy()

    fireEvent.click(openButton)

    expect(nextButton.hasAttribute('disabled')).toBeTruthy()
    expect(prevButton.hasAttribute('disabled')).toBeTruthy()
    expect(openButton.hasAttribute('disabled')).toBeFalsy()

    fireEvent.click(getByText('Jan'))

    expect(nextButton.hasAttribute('disabled')).toBeFalsy()
    expect(prevButton.hasAttribute('disabled')).toBeFalsy()
    expect(openButton.hasAttribute('disabled')).toBeFalsy()
  })

  it('should fill the prop year if none is given', () => {
    const { rerender, getAllByText } = render(<MonthPaginator month={now.getMonth()} year={now.getFullYear()} />)

    rerender(<MonthPaginator month={now.getMonth()} />)
    expect(getAllByText(renderMonthYear(now.getMonth(), new Date().getFullYear()))).toHaveLength(1)
  })

  it('should change the visible year on re-render', () => {
    const { rerender, getAllByText } = render(<MonthPaginator />)

    const newYear = now.getFullYear() + 1

    rerender(<MonthPaginator year={newYear} />)
    expect(getAllByText(renderMonthYear(now.getMonth(), newYear))).toHaveLength(1)
  })
})

describe('MonthPaginator picker', () => {
  // Popper places the picker and the tooltips asynchronously
  const flush = () => act(async () => undefined)

  it('should call onChange once, with the month clicked in the year shown by the picker', async () => {
    const onChange = jest.fn()
    const { getByTestId, getByTitle, getByText } = render(<MonthPaginator month={10} year={2026} onChange={onChange} />)

    fireEvent.click(getByTestId('MonthPaginator.ShowMonthsButton'))
    await flush()
    fireEvent.click(getByTitle('Previous year'))
    fireEvent.click(getByTitle('Previous year'))
    expect(onChange).not.toHaveBeenCalled()
    expect(getByText('2024')).toBeInTheDocument()

    fireEvent.click(getByText('Mar'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ month: 2, year: 2024 })
    expect(getByText(renderMonthYear(2, 2024))).toBeInTheDocument()
  })

  it('should show the year of the month again when the picker opens again', async () => {
    const { getByTestId, getByTitle, getByText } = render(<MonthPaginator month={10} year={2026} />)

    fireEvent.click(getByTestId('MonthPaginator.ShowMonthsButton'))
    await flush()
    fireEvent.click(getByTitle('Next year'))
    fireEvent.click(getByTestId('MonthPaginator.ShowMonthsButton'))
    expect(getByText(renderMonthYear(10, 2026))).toBeInTheDocument()

    fireEvent.click(getByTestId('MonthPaginator.ShowMonthsButton'))
    await flush()
    expect(getByText('2026')).toBeInTheDocument()
  })

  it('should place the picker with the styles and attributes of Popper', async () => {
    const { container, getByTestId, getByText } = render(<MonthPaginator month={10} year={2026} />)
    fireEvent.click(getByTestId('MonthPaginator.ShowMonthsButton'))
    await flush()

    const picker = container.querySelector<HTMLElement>('[data-popper-placement]')
    expect(picker).toHaveAttribute('data-popper-placement', 'bottom-start')
    expect(picker).toContainElement(getByText('Mar'))
    expect(picker.style.position).toBe('absolute')
  })

  it('should name the arrows while their tooltips show', async () => {
    const { getByTestId, getByRole } = render(<MonthPaginator month={10} year={2026} />)

    fireEvent.focus(getByTestId('MonthPaginator.PrevButton'))
    await flush()
    expect(getByRole('button', { name: 'Previous month' })).toBe(getByTestId('MonthPaginator.PrevButton'))

    fireEvent.focus(getByTestId('MonthPaginator.NextButton'))
    await flush()
    expect(getByRole('button', { name: 'Next month' })).toBe(getByTestId('MonthPaginator.NextButton'))
  })
})

describe('MonthPaginator default month', () => {
  afterEach(() => jest.useRealTimers())

  it('should start at the month of the day it renders', () => {
    // The types of Jest here are older than its modern timers
    const timers = jest as any
    timers.useFakeTimers('modern')
    timers.setSystemTime(new Date(2031, 4, 15))
    const { getByText } = render(<MonthPaginator />)
    expect(getByText(renderMonthYear(4, 2031))).toBeInTheDocument()
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
})
