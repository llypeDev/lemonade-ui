import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { useCollapse, UseCollapseOptions } from '../useCollapse'

const { matchMedia } = window
afterEach(() => {
  window.matchMedia = matchMedia
  jest.restoreAllMocks()
  jest.useRealTimers()
})
const prefersReducedMotion = (reduce: boolean) => {
  window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
}

// jsdom has no layout: the content takes 100px
const mockLayout = () => {
  jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(100)
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return { height: this.style.height ? parseFloat(this.style.height) : 100 } as DOMRect
  })
}
// The heights the element goes through, in order
const watchHeights = (element: HTMLElement) => {
  const setHeight = jest.spyOn(CSSStyleDeclaration.prototype, 'height', 'set')
  return () =>
    setHeight.mock.calls
      .filter((_, i) => (setHeight.mock.instances[i] as unknown) === element.style)
      .map(([height]) => height)
}

const List = (props: { expanded: boolean } & UseCollapseOptions) => {
  const { expanded, ...options } = props
  const collapse = useCollapse<HTMLUListElement>(expanded, options)
  return (
    <ul ref={collapse.ref} hidden={collapse.hidden} data-testid='list'>
      <li>Item</li>
    </ul>
  )
}

it('should slide from and to the collapsed height given', () => {
  prefersReducedMotion(false)
  mockLayout()
  const collapsedHeight = jest.fn(() => 40)
  const { getByTestId, rerender } = render(<List expanded={false} collapsedHeight={collapsedHeight} />)
  const list = getByTestId('list')
  const heights = watchHeights(list)

  rerender(<List expanded collapsedHeight={collapsedHeight} />)
  expect(collapsedHeight).toHaveBeenCalledWith(list)
  expect(heights()).toEqual(['40px', '100px'])
  fireEvent.transitionEnd(list)
  expect(heights()).toEqual(['40px', '100px', ''])

  rerender(<List expanded={false} collapsedHeight={collapsedHeight} />)
  expect(heights()).toEqual(['40px', '100px', '', '100px', '40px'])
  expect(list).not.toHaveAttribute('hidden')
  fireEvent.transitionEnd(list)
  expect(list).toHaveAttribute('hidden')
  expect(list.style.height).toBe('')
})

it('should not measure the collapsed height with reduced motion', () => {
  prefersReducedMotion(true)
  const collapsedHeight = jest.fn(() => 40)
  const { getByTestId, rerender } = render(<List expanded collapsedHeight={collapsedHeight} />)

  rerender(<List expanded={false} collapsedHeight={collapsedHeight} />)
  expect(collapsedHeight).not.toHaveBeenCalled()
  expect(getByTestId('list')).toHaveAttribute('hidden')
})

it('should not end with the transition of an element inside', () => {
  prefersReducedMotion(false)
  const { getByTestId, getByText, rerender } = render(<List expanded />)
  const list = getByTestId('list')

  rerender(<List expanded={false} />)
  fireEvent.transitionEnd(getByText('Item'))
  expect(list).not.toHaveAttribute('hidden')
  expect(list.style.height).toBe('0px')

  fireEvent.transitionEnd(list)
  expect(list).toHaveAttribute('hidden')
})

const Nested = (props: { outer: boolean; inner: boolean }) => {
  const outer = useCollapse(props.outer)
  const inner = useCollapse(props.inner)
  return (
    <div ref={outer.ref} hidden={outer.hidden} data-testid='outer'>
      <div ref={inner.ref} hidden={inner.hidden} data-testid='inner'>
        Item
      </div>
    </div>
  )
}

it('should make room in an element still sliding open as one inside it opens or closes', () => {
  jest.useFakeTimers()
  prefersReducedMotion(false)
  mockLayout()
  const { getByTestId, rerender } = render(<Nested outer={false} inner={false} />)
  const outer = getByTestId('outer')
  const inner = getByTestId('inner')

  rerender(<Nested outer inner={false} />)
  expect(outer.style.height).toBe('100px')
  jest.advanceTimersByTime(150)

  rerender(<Nested outer inner />)
  expect(inner.style.height).toBe('100px')
  expect(outer.style.height).toBe('200px')
  // It slides to its new height for as long as it takes, instead of ending at the time first set
  jest.advanceTimersByTime(150)
  expect(outer.style.height).toBe('200px')

  rerender(<Nested outer inner={false} />)
  expect(inner.style.height).toBe('0px')
  expect(outer.style.height).toBe('100px')

  fireEvent.transitionEnd(inner)
  fireEvent.transitionEnd(outer)
  expect(outer.style.height).toBe('')
})

it('should not make room in an element that is closing', () => {
  prefersReducedMotion(false)
  mockLayout()
  const { getByTestId, rerender } = render(<Nested outer inner={false} />)
  const outer = getByTestId('outer')

  rerender(<Nested outer={false} inner={false} />)
  expect(outer.style.height).toBe('0px')
  rerender(<Nested outer={false} inner />)
  expect(outer.style.height).toBe('0px')

  fireEvent.transitionEnd(getByTestId('inner'))
  fireEvent.transitionEnd(outer)
  expect(outer).toHaveAttribute('hidden')
})
