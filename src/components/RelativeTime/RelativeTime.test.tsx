import { act, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { RelativeTime, relativeTimeParts } from './RelativeTime'

const now = new Date('2024-05-10T12:00:00Z')
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000)

describe('RelativeTime', () => {
  it('should render correctly', () => {
    const { container } = render(
      <RelativeTime
        date={ago(2 * 60 * 60)}
        now={now}
        dateFormat={{ day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should describe the time from now', () => {
    const text = (date: Date) => render(<RelativeTime date={date} now={now} />).container.textContent

    expect(text(ago(10))).toBe('now')
    expect(text(ago(5 * 60))).toBe('5 minutes ago')
    expect(text(ago(3 * 60 * 60))).toBe('3 hours ago')
    expect(text(ago(26 * 60 * 60))).toBe('yesterday')
    expect(text(ago(-3 * 24 * 60 * 60))).toBe('in 3 days')
    expect(text(ago(400 * 24 * 60 * 60))).toBe('last year')
  })

  it('should not say 60 minutes or 24 hours', () => {
    expect(relativeTimeParts(-59.7 * 60)).toEqual([-1, 'hour'])
    expect(relativeTimeParts(23.8 * 60 * 60)).toEqual([1, 'day'])
    expect(relativeTimeParts(-6.8 * 24 * 60 * 60)).toEqual([-1, 'week'])
    expect(relativeTimeParts(-11.8 * 30.44 * 24 * 60 * 60)).toEqual([-1, 'year'])
  })

  it('should use the language of the locale strings', () => {
    const { container } = render(
      <LocaleContext.Provider value={ptBR}>
        <RelativeTime date={ago(2 * 60 * 60)} now={now} />
      </LocaleContext.Provider>
    )
    expect(container).toHaveTextContent('há 2 horas')
  })

  it('should accept a language and a shorter format', () => {
    const { container } = render(<RelativeTime date={ago(2 * 60 * 60)} now={now} language='en' format='short' />)
    expect(container).toHaveTextContent('2 hr. ago')
  })

  it('should give the exact moment in the datetime attribute and the full date in the title', () => {
    const { container } = render(
      <RelativeTime
        date='2024-05-10T09:30:00Z'
        now={now}
        dateFormat={{ day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }}
      />
    )
    const time = container.querySelector('time')
    expect(time).toHaveAttribute('datetime', '2024-05-10T09:30:00.000Z')
    expect(time).toHaveAttribute('title', 'May 10, 2024')
  })

  it('should not show a tooltip when tooltip is false', () => {
    const { container } = render(<RelativeTime date={ago(60)} now={now} tooltip={false} />)
    expect(container.querySelector('time')).not.toHaveAttribute('title')
  })

  it('should render nothing for an invalid date', () => {
    const { container } = render(<RelativeTime date='not a date' now={now} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should update by itself', () => {
    jest.useFakeTimers()
    const spy = jest.spyOn(Date, 'now').mockReturnValue(now.getTime())

    const { container } = render(<RelativeTime date={ago(30)} />)
    expect(container).toHaveTextContent('now')

    spy.mockReturnValue(now.getTime() + 40 * 1000)
    act(() => {
      jest.advanceTimersByTime(10 * 1000)
    })
    expect(container).toHaveTextContent('1 minute ago')

    spy.mockRestore()
    jest.useRealTimers()
  })
})
