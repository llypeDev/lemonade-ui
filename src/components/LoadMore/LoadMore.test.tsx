import { act, fireEvent, render } from '@testing-library/react'
import React, { useRef, useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { LoadMore } from './LoadMore'

const all = Array.from({ length: 7 }, (_, index) => `Order #${index + 1}`)

const Orders = (props: { async?: boolean; links?: boolean }) => {
  const [count, setCount] = useState(3)
  const listRef = useRef<HTMLUListElement>(null)

  const loadMore = () => {
    const next = () => setCount((current) => Math.min(all.length, current + 3))
    if (props.async) {
      return new Promise<void>((resolve) => setTimeout(() => resolve(next()), 100))
    }
    next()
  }

  return (
    <>
      <ul ref={listRef}>
        {all.slice(0, count).map((order) => (
          <li key={order}>{props.links ? <a href={`#${order}`}>{order}</a> : order}</li>
        ))}
      </ul>
      <LoadMore loaded={count} total={all.length} onLoadMore={loadMore} listRef={listRef} />
    </>
  )
}

describe('LoadMore', () => {
  it('should render correctly', () => {
    const { container } = render(<LoadMore loaded={20} total={54} onLoadMore={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  it('should say how many items are shown', () => {
    const { getByText } = render(<Orders />)
    expect(getByText('Showing 3 of 7')).toBeInTheDocument()
  })

  it('should load more, announce the new items and focus the first of them', () => {
    const { getByRole, getByText } = render(<Orders />)

    fireEvent.click(getByRole('button', { name: 'Load more' }))
    expect(getByText('Showing 6 of 7')).toBeInTheDocument()
    expect(getByRole('status')).toHaveTextContent('3 more items loaded.')
    expect(getByText('Order #4')).toHaveFocus()
    expect(getByText('Order #4')).toHaveAttribute('tabindex', '-1')
  })

  it('should focus the link of the first new item', () => {
    const { getByRole } = render(<Orders links />)
    fireEvent.click(getByRole('button', { name: 'Load more' }))
    expect(getByRole('link', { name: 'Order #4' })).toHaveFocus()
  })

  it('should hide the button when all the items are shown', () => {
    const { getByRole, queryByRole, getByText } = render(<Orders />)

    fireEvent.click(getByRole('button', { name: 'Load more' }))
    fireEvent.click(getByRole('button', { name: 'Load more' }))
    expect(getByText('All 7 items are shown')).toBeInTheDocument()
    expect(queryByRole('button')).not.toBeInTheDocument()
    expect(getByRole('status')).toHaveTextContent('1 more items loaded.')
  })

  it('should wait for a promise and show a spinner meanwhile', async () => {
    jest.useFakeTimers()
    const { getByRole, getByText } = render(<Orders async />)
    const button = getByRole('button', { name: 'Load more' })

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-busy', 'true')

    await act(async () => {
      jest.advanceTimersByTime(100)
    })
    expect(getByText('Order #4')).toHaveFocus()
    expect(button).not.toHaveAttribute('aria-busy')
    jest.useRealTimers()
  })

  it('should keep the button without a total until hasMore is false', () => {
    const { getByRole, queryByRole, rerender } = render(<LoadMore loaded={10} onLoadMore={jest.fn()} />)
    expect(getByRole('button', { name: 'Load more' })).toBeInTheDocument()

    rerender(<LoadMore loaded={12} hasMore={false} onLoadMore={jest.fn()} />)
    expect(queryByRole('button')).not.toBeInTheDocument()
  })

  it('should not move the focus when items arrive without a click', () => {
    const { getByText, rerender } = render(<LoadMore loaded={3} total={7} onLoadMore={jest.fn()} />)
    rerender(<LoadMore loaded={6} total={7} onLoadMore={jest.fn()} />)
    expect(getByText('Showing 6 of 7')).toBeInTheDocument()
    expect(document.body).toHaveFocus()
  })

  it('should use the locale strings', () => {
    const { getByRole, getByText } = render(
      <LocaleContext.Provider value={ptBR}>
        <LoadMore loaded={20} total={54} onLoadMore={jest.fn()} />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Carregar mais' })).toBeInTheDocument()
    expect(getByText('Mostrando 20 de 54')).toBeInTheDocument()
  })
})
