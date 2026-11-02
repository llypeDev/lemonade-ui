import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { hydrate, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'

import { useBreakpoint } from '../useBreakpoint'

const { innerWidth } = window

const resize = (width: number) => Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })

afterEach(() => resize(innerWidth))

it('should start each breakpoint at its own width, as the media queries of the theme', () => {
  resize(1280)
  expect(renderHook(() => useBreakpoint()).result.current).toBe('lg')

  resize(1279)
  expect(renderHook(() => useBreakpoint()).result.current).toBe('md')

  resize(600)
  expect(renderHook(() => useBreakpoint()).result.current).toBe('sm')

  resize(0)
  expect(renderHook(() => useBreakpoint()).result.current).toBe('xs')
})

it('should render nothing first, as on the server, and then the breakpoint', () => {
  resize(1280)
  const Current = () => <span>{useBreakpoint() ?? 'none'}</span>
  const container = document.createElement('div')
  // What the server renders without a window
  container.innerHTML = '<span>none</span>'
  const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)

  act(() => {
    hydrate(<Current />, container)
  })
  expect(error).not.toHaveBeenCalled()
  expect(container.textContent).toBe('lg')

  error.mockRestore()
  unmountComponentAtNode(container)
})
