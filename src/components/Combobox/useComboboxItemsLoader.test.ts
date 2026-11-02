import { act, renderHook } from '@testing-library/react-hooks'

import { useComboboxItemsLoader } from './useComboboxItemsLoader'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

it('should keep the items of the latest filter when an older answer arrives later', async () => {
  const items = jest.fn((filter: string) => wait(filter === 'a' ? 60 : 10).then(() => [filter]))
  const { result } = renderHook(() => useComboboxItemsLoader(items, 0))

  act(() => result.current.loadItems('a'))
  await act(() => wait(5))
  act(() => result.current.loadItems('b'))
  await act(() => wait(100))

  expect(items).toHaveBeenCalledTimes(2)
  expect(result.current.items).toEqual(['b'])
  expect(result.current.loading).toBe(false)
})

it('should not update the state after unmounting', async () => {
  const error = jest.spyOn(console, 'error')
  const { result, unmount } = renderHook(() => useComboboxItemsLoader(() => wait(10).then(() => ['a']), 0))

  act(() => result.current.loadItems('a'))
  await act(() => wait(2))
  unmount()
  await wait(30)

  expect(error).not.toHaveBeenCalled()
  error.mockRestore()
})

it('should drop a load waiting for the debounce when unmounting', async () => {
  const items = jest.fn(() => ['a'])
  const { result, unmount } = renderHook(() => useComboboxItemsLoader(items, 20))

  act(() => result.current.loadItems('a'))
  unmount()
  await wait(40)

  expect(items).not.toHaveBeenCalled()
})

it('should keep one debounce when the loader is a new function on each render', async () => {
  const calls: string[] = []
  const { result, rerender } = renderHook(
    ({ suffix }) =>
      useComboboxItemsLoader((filter: string) => {
        calls.push(filter)
        return [filter + suffix]
      }, 20),
    { initialProps: { suffix: '1' } }
  )

  act(() => result.current.loadItems('a'))
  rerender({ suffix: '2' })
  act(() => result.current.loadItems('ab'))
  rerender({ suffix: '3' })
  await act(() => wait(60))

  // Only the last filter loads, with the latest loader
  expect(calls).toEqual(['ab'])
  expect(result.current.items).toEqual(['ab3'])
})

it('should end the loading and empty the list when the loader throws', async () => {
  let fail = false
  const { result } = renderHook(() =>
    useComboboxItemsLoader((filter: string) => {
      if (fail) throw new Error('broken loader')
      return [filter]
    }, 0)
  )

  act(() => result.current.loadItems('a'))
  await act(() => wait(20))
  expect(result.current.items).toEqual(['a'])

  fail = true
  act(() => result.current.loadItems('b'))
  await act(() => wait(20))

  expect(result.current.loading).toBe(false)
  expect(result.current.items).toEqual([])
})

it('should handle a rejected load', async () => {
  const unhandled = jest.fn()
  const nodeProcess = process as any
  nodeProcess.on('unhandledRejection', unhandled)
  const { result } = renderHook(() => useComboboxItemsLoader(() => Promise.reject(new Error('offline')), 0))

  act(() => result.current.loadItems('a'))
  await act(() => wait(20))

  nodeProcess.off('unhandledRejection', unhandled)
  expect(result.current.loading).toBe(false)
  expect(result.current.items).toEqual([])
  expect(unhandled).not.toHaveBeenCalled()
})

it('should give the loader an empty filter instead of a missing one', async () => {
  const items = jest.fn((filter: string) => [filter])
  const { result } = renderHook(() => useComboboxItemsLoader(items, 0))

  act(() => result.current.loadItems(null))
  await act(() => wait(20))

  expect(items).toHaveBeenCalledWith('')
})
