import { act, fireEvent, render } from '@testing-library/react'
import { act as actHook, renderHook } from '@testing-library/react-hooks'
import React from 'react'
import waait from 'waait'

import en from '../../i18n/locales/en-US'
import { SelectAsync } from './SelectAsync'
import { useAsyncSelect } from './useAsyncSelect'

describe('async loading', () => {
  it('should NOT call "loadItems" when mounted', () => {
    const loadItems = jest.fn(() => Promise.resolve(['Item 1', 'Item 2']))
    render(<SelectAsync loadItems={loadItems} itemToString={(item) => item} />)
    expect(loadItems).not.toHaveBeenCalledWith()
  })

  it('should call "loadItems" on first interaction', async () => {
    const loadItems = jest.fn(() => Promise.resolve(['Item 1', 'Item 2']))
    const { container } = render(<SelectAsync loadItems={loadItems} itemToString={(item) => item} />)

    container.querySelector('input').focus()
    await act(() => waait(300))
    expect(loadItems).not.toHaveBeenCalledWith()

    await act(() => waait(300))
    expect(loadItems).toHaveBeenCalledWith(null)
  })

  it('should load the items and call the "onFilterChange" of the consumer', async () => {
    const loadItems = jest.fn((filter: string) => Promise.resolve([`${filter} 1`]))
    const onFilterChange = jest.fn()
    const { container } = render(
      <SelectAsync loadItems={loadItems} onFilterChange={onFilterChange} itemToString={(item) => item} delay={0} />
    )

    fireEvent.change(container.querySelector('input'), { target: { value: 'Item' } })
    await act(() => waait(20))

    expect(onFilterChange).toHaveBeenCalledWith('Item', expect.anything())
    expect(loadItems).toHaveBeenCalledWith('Item')
    expect(container.querySelector('[role="option"]')).toHaveTextContent('Item 1')
  })

  it('should show its own loading besides the "loading" of the consumer', async () => {
    const loadItems = jest.fn(() => new Promise<string[]>(() => undefined))
    const { container, queryByText } = render(
      <SelectAsync loadItems={loadItems} loading={false} itemToString={(item) => item} delay={0} />
    )

    fireEvent.change(container.querySelector('input'), { target: { value: 'Item' } })
    await act(() => waait(20))

    expect(queryByText(en.select.loadingItem)).toBeTruthy()
  })
})

describe('useAsyncSelect', () => {
  const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  it('should keep the items of the latest filter when an older answer arrives later', async () => {
    const loadItems = jest.fn((filter: string) => wait(filter === 'a' ? 60 : 10).then(() => [filter]))
    const { result } = renderHook(() => useAsyncSelect(loadItems, 0))

    actHook(() => result.current.getSelectProps().onFilterChange('a'))
    await actHook(() => wait(5))
    actHook(() => result.current.getSelectProps().onFilterChange('b'))
    await actHook(() => wait(100))

    expect(loadItems).toHaveBeenCalledTimes(2)
    expect(result.current.getSelectProps().items).toEqual(['b'])
    expect(result.current.getSelectProps().loading).toBe(false)
  })

  it('should not update the state after unmounting', async () => {
    const error = jest.spyOn(console, 'error')
    const { result, unmount } = renderHook(() => useAsyncSelect(() => wait(10).then(() => ['a']), 0))

    actHook(() => result.current.getSelectProps().onFilterChange('a'))
    await actHook(() => wait(2))
    unmount()
    await wait(30)

    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it('should drop a load waiting for the delay when unmounting', async () => {
    const loadItems = jest.fn(() => Promise.resolve(['a']))
    const { result, unmount } = renderHook(() => useAsyncSelect(loadItems, 20))

    actHook(() => result.current.getSelectProps().onFilterChange('a'))
    unmount()
    await wait(40)

    expect(loadItems).not.toHaveBeenCalled()
  })
})
