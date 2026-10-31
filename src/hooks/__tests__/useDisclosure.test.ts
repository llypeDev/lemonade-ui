import { act, renderHook } from '@testing-library/react-hooks'

import { useDisclosure } from '../useDisclosure'

it('should open, close and toggle', () => {
  const { result } = renderHook(() => useDisclosure())
  expect(result.current.open).toBe(false)

  act(() => result.current.onOpen())
  expect(result.current.open).toBe(true)

  act(() => result.current.onToggle())
  expect(result.current.open).toBe(false)

  act(() => result.current.onToggle())
  act(() => result.current.onClose())
  expect(result.current.open).toBe(false)

  act(() => result.current.setOpen(true))
  expect(result.current.open).toBe(true)
})

it('should start with the initial state and keep the functions between renders', () => {
  const { result, rerender } = renderHook(() => useDisclosure(true))
  expect(result.current.open).toBe(true)

  const { onOpen, onClose, onToggle } = result.current
  rerender()
  expect(result.current.onOpen).toBe(onOpen)
  expect(result.current.onClose).toBe(onClose)
  expect(result.current.onToggle).toBe(onToggle)
})
