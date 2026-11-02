/**
 * @jest-environment node
 */
import React from 'react'
import { renderToString } from 'react-dom/server'

import { StickyContainer } from '../../components/StickyContainer'
import { useBreakpoint } from '../useBreakpoint'
import { useLocalStorage } from '../useLocalStorage'

it('should render without a window', () => {
  expect(typeof window).toBe('undefined')

  const Breakpoint = () => <span>{useBreakpoint() ?? 'none'}</span>
  const Theme = () => <span>{useLocalStorage('theme', 'light')[0]}</span>

  expect(renderToString(<StickyContainer>Content</StickyContainer>)).toContain('Content')
  // The browser renders the same first, so the page hydrates without mismatches
  expect(renderToString(<Breakpoint />)).toContain('>none</span>')
  expect(renderToString(<Theme />)).toContain('>light</span>')
})
