import { act, render } from '@testing-library/react'
import React, { useRef } from 'react'

import { Portal } from '../Portal'

import { FadeTransition } from './FadeTransition'

const { matchMedia } = window

const prefersReducedMotion = (reduce: boolean) => {
  window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
}

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  window.matchMedia = matchMedia
  jest.useRealTimers()
})

// As in a modal, what fades is in a portal, where the transition finds it only by `nodeRef`
const Fade = (props: { show: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <FadeTransition in={props.show} nodeRef={ref}>
      {({ state, className }) =>
        (props.show || state !== 'exited') && (
          <Portal>
            <div ref={ref} className={className} data-testid='fade' data-state={state} />
          </Portal>
        )
      }
    </FadeTransition>
  )
}

it('should fade out for its whole timeout before it ends', () => {
  prefersReducedMotion(false)
  const { rerender, getByTestId, queryByTestId } = render(<Fade show />)
  expect(getByTestId('fade')).toHaveAttribute('data-state', 'entered')
  expect(getByTestId('fade')).toHaveStyle('opacity: 1')

  rerender(<Fade show={false} />)
  expect(getByTestId('fade')).toHaveAttribute('data-state', 'exiting')
  expect(getByTestId('fade')).toHaveStyle('opacity: 0')
  expect(getByTestId('fade')).toHaveStyle('transition: opacity 200ms ease-in-out')

  act(() => {
    jest.advanceTimersByTime(199)
  })
  expect(getByTestId('fade')).toHaveAttribute('data-state', 'exiting')

  act(() => {
    jest.advanceTimersByTime(1)
  })
  expect(queryByTestId('fade')).toBeNull()
})

it('should fade in from transparent while it enters', () => {
  prefersReducedMotion(false)
  // The transparent state is laid out before the fade starts, otherwise the browser has nothing to fade from
  const opacities: string[] = []
  const { getBoundingClientRect } = HTMLElement.prototype
  const layout = jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      this.dataset.testid === 'fade' && opacities.push(getComputedStyle(this).opacity)
      return getBoundingClientRect.call(this)
    })

  const { rerender, getByTestId } = render(<Fade show={false} />)
  rerender(<Fade show />)
  layout.mockRestore()

  expect(opacities).toEqual(['0'])
  expect(getByTestId('fade')).toHaveAttribute('data-state', 'entering')
  expect(getByTestId('fade')).toHaveStyle('opacity: 1')

  act(() => {
    jest.advanceTimersByTime(200)
  })
  expect(getByTestId('fade')).toHaveAttribute('data-state', 'entered')
  expect(getByTestId('fade')).toHaveStyle('opacity: 1')
})

it('should not fade with reduced motion, even when the browser lays out the transparent state', () => {
  // Such as when the focus trap of a modal looks for what it can focus
  const { getByTestId } = render(<Fade show />)
  expect(getByTestId('fade')).toHaveStyleRule('transition', 'none', { media: '(prefers-reduced-motion:reduce)' })
})

it.each([
  ['the user asks for reduced motion', () => prefersReducedMotion(true)],
  ['there is no matchMedia, as in server rendering', () => (window.matchMedia = undefined)],
])('should show and hide at once when %s', (_, setUp) => {
  setUp()
  const { rerender, getByTestId, queryByTestId } = render(<Fade show={false} />)

  rerender(<Fade show />)
  expect(getByTestId('fade')).toHaveAttribute('data-state', 'entered')

  rerender(<Fade show={false} />)
  expect(queryByTestId('fade')).toBeNull()
})
