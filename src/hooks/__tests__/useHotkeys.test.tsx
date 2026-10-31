import { fireEvent, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import React, { useRef } from 'react'

import { parseHotkey, useHotkeys } from '../useHotkeys'

const platform = jest.spyOn(window.navigator, 'platform', 'get')

beforeEach(() => platform.mockReturnValue('Win32'))

it('should run the handler for the shortcut', () => {
  const handler = jest.fn()
  renderHook(() => useHotkeys('ctrl+s', handler))

  fireEvent.keyDown(document, { key: 's' })
  expect(handler).not.toHaveBeenCalled()

  const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })
  document.dispatchEvent(event)
  expect(handler).toHaveBeenCalledTimes(1)
  expect(event.defaultPrevented).toBe(true)
})

it('should take a list of shortcuts and named keys', () => {
  const handler = jest.fn()
  renderHook(() => useHotkeys(['esc', 'shift+up'], handler))

  fireEvent.keyDown(document, { key: 'Escape' })
  fireEvent.keyDown(document, { key: 'ArrowUp' })
  fireEvent.keyDown(document, { key: 'ArrowUp', shiftKey: true })
  expect(handler).toHaveBeenCalledTimes(2)
})

it('should use meta for mod on Apple devices and ctrl elsewhere', () => {
  expect(parseHotkey('mod+k')).toMatchObject({ key: 'k', ctrl: true, meta: false })

  platform.mockReturnValue('MacIntel')
  expect(parseHotkey('mod+k')).toMatchObject({ key: 'k', ctrl: false, meta: true })

  const handler = jest.fn()
  renderHook(() => useHotkeys('mod+k', handler))
  fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
  expect(handler).not.toHaveBeenCalled()
  fireEvent.keyDown(document, { key: 'K', metaKey: true })
  expect(handler).toHaveBeenCalledTimes(1)
})

it('should accept characters typed with shift and the plus key', () => {
  expect(parseHotkey('ctrl++')).toMatchObject({ key: '+', ctrl: true })

  const handler = jest.fn()
  renderHook(() => useHotkeys('?', handler))
  fireEvent.keyDown(document, { key: '?', shiftKey: true })
  expect(handler).toHaveBeenCalledTimes(1)
})

it('should not run in form fields unless asked, nor when turned off', () => {
  const handler = jest.fn()
  const Form = (props: { enableOnFormFields?: boolean; enabled?: boolean }) => {
    useHotkeys('/', handler, props)
    return (
      <>
        <input aria-label='Search' />
        <input type='checkbox' aria-label='Done' />
      </>
    )
  }
  const { getByLabelText, rerender } = render(<Form />)

  fireEvent.keyDown(getByLabelText('Search'), { key: '/' })
  expect(handler).not.toHaveBeenCalled()
  fireEvent.keyDown(getByLabelText('Done'), { key: '/' })
  expect(handler).toHaveBeenCalledTimes(1)

  rerender(<Form enableOnFormFields />)
  fireEvent.keyDown(getByLabelText('Search'), { key: '/' })
  expect(handler).toHaveBeenCalledTimes(2)

  rerender(<Form enabled={false} />)
  fireEvent.keyDown(document, { key: '/' })
  expect(handler).toHaveBeenCalledTimes(2)
})

it('should listen only inside the target and keep the browser action when asked', () => {
  const handler = jest.fn()
  const Panel = () => {
    const ref = useRef<HTMLDivElement>(null)
    useHotkeys('delete', handler, { target: ref, preventDefault: false })
    return (
      <div ref={ref} data-testid='panel'>
        <button>Item</button>
      </div>
    )
  }
  const { getByRole } = render(<Panel />)

  fireEvent.keyDown(document, { key: 'Delete' })
  expect(handler).not.toHaveBeenCalled()

  const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })
  getByRole('button').dispatchEvent(event)
  expect(handler).toHaveBeenCalledTimes(1)
  expect(event.defaultPrevented).toBe(false)
})

it('should call the latest handler without listening again', () => {
  const first = jest.fn()
  const second = jest.fn()
  const { rerender } = renderHook(({ handler }) => useHotkeys('k', handler), { initialProps: { handler: first } })

  rerender({ handler: second })
  fireEvent.keyDown(document, { key: 'k' })
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledTimes(1)
})
