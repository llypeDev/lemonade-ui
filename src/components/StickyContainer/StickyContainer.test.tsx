import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { StickyContainer } from './StickyContainer'

it('should render correctly', () => {
  const { container } = render(<StickyContainer>Content</StickyContainer>)
  expect(container).toMatchSnapshot()
})

it('should become fixed when the window scrolls past top, 0 by default', () => {
  const { container, rerender } = render(<StickyContainer>Content</StickyContainer>)
  const sticky = container.firstElementChild
  expect(sticky).toHaveStyleRule('position', 'absolute')

  act(() => {
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
    fireEvent.scroll(document)
  })
  expect(sticky).toHaveStyleRule('position', 'fixed')

  rerender(<StickyContainer top={200}>Content</StickyContainer>)
  expect(sticky).toHaveStyleRule('position', 'absolute')

  act(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    fireEvent.scroll(document)
  })
})

it('should accept the style prop', () => {
  const { container } = render(<StickyContainer style={{ color: 'red' }}>Content</StickyContainer>)
  expect(container).toMatchSnapshot()
})
