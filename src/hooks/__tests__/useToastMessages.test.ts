import { act, renderHook } from '@testing-library/react-hooks'

import { useToastMessages } from '../useToastMessages'

afterEach(() => {
  jest.restoreAllMocks()
})

it('should give a different id to toasts shown at the same time', () => {
  jest.spyOn(Date, 'now').mockReturnValue(1000)
  const { result } = renderHook(() => useToastMessages())

  act(() => {
    result.current.showToast({ title: 'First', message: 'first' })
    result.current.showToast({ title: 'Second', message: 'second' })
  })

  const [first, second] = result.current.toastMessages
  expect(first.id).not.toEqual(second.id)

  act(() => first.removeToast(first.id))
  expect(result.current.toastMessages.map((toast) => toast.title)).toEqual(['Second'])
})
