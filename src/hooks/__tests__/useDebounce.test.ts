import { act, renderHook } from '@testing-library/react-hooks'

import { useDebounce } from '../useDebounce'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

it('should return the value only after it stops changing', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: 'a' },
  })
  expect(result.current).toBe('a')

  rerender({ value: 'ab' })
  act(() => {
    jest.advanceTimersByTime(200)
  })
  rerender({ value: 'abc' })
  act(() => {
    jest.advanceTimersByTime(200)
  })
  expect(result.current).toBe('a')

  act(() => {
    jest.advanceTimersByTime(100)
  })
  expect(result.current).toBe('abc')
})

it('should wait 300 ms by default', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value), { initialProps: { value: 1 } })
  rerender({ value: 2 })
  act(() => {
    jest.advanceTimersByTime(299)
  })
  expect(result.current).toBe(1)
  act(() => {
    jest.advanceTimersByTime(1)
  })
  expect(result.current).toBe(2)
})
