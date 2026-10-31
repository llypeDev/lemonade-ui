import { act, renderHook } from '@testing-library/react-hooks'

import { useLocalStorage } from '../useLocalStorage'

beforeEach(() => window.localStorage.clear())

it('should start with the initial value and save changes as JSON', () => {
  const { result } = renderHook(() => useLocalStorage('density', 'comfortable'))
  expect(result.current[0]).toBe('comfortable')

  act(() => result.current[1]('compact'))
  expect(result.current[0]).toBe('compact')
  expect(window.localStorage.getItem('density')).toBe('"compact"')
})

it('should read a saved value and take an updater function', () => {
  window.localStorage.setItem('count', '5')
  const { result } = renderHook(() => useLocalStorage('count', 0))
  expect(result.current[0]).toBe(5)

  act(() => {
    result.current[1]((value) => value + 1)
    result.current[1]((value) => value + 1)
  })
  expect(result.current[0]).toBe(7)
  expect(window.localStorage.getItem('count')).toBe('7')
})

it('should remove the value and bring back the initial one', () => {
  window.localStorage.setItem('filters', '["paid"]')
  const { result } = renderHook(() => useLocalStorage<string[]>('filters', []))
  expect(result.current[0]).toEqual(['paid'])

  act(() => result.current[2]())
  expect(result.current[0]).toEqual([])
  expect(window.localStorage.getItem('filters')).toBeNull()
})

it('should ignore a value that is not JSON', () => {
  window.localStorage.setItem('theme', 'not json')
  const { result } = renderHook(() => useLocalStorage('theme', 'light'))
  expect(result.current[0]).toBe('light')
})

it('should follow changes from other tabs', () => {
  const { result } = renderHook(() => useLocalStorage('theme', 'light'))

  act(() => {
    window.localStorage.setItem('theme', '"dark"')
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }))
  })
  expect(result.current[0]).toBe('dark')

  act(() => {
    window.localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))
  })
  expect(result.current[0]).toBe('light')
})

it('should keep working when the storage is full', () => {
  const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('QuotaExceededError')
  })
  const { result } = renderHook(() => useLocalStorage('draft', ''))

  act(() => result.current[1]('Hello'))
  expect(result.current[0]).toBe('Hello')
  setItem.mockRestore()
})

it('should read the value of a new key', () => {
  window.localStorage.setItem('a', '"first"')
  window.localStorage.setItem('b', '"second"')
  const { result, rerender } = renderHook(({ key }) => useLocalStorage(key, ''), { initialProps: { key: 'a' } })
  expect(result.current[0]).toBe('first')

  rerender({ key: 'b' })
  expect(result.current[0]).toBe('second')
})
