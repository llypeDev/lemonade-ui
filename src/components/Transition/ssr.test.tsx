/**
 * @jest-environment node
 */
import React from 'react'
import { renderToString } from 'react-dom/server'

import { Drawer } from '../Drawer'
import { Modal } from '../Modal'

it('should render open overlays without a window', () => {
  expect(typeof window).toBe('undefined')
  const error = jest.spyOn(console, 'error')

  // The portals of the overlays render nothing on the server
  expect(renderToString(<Modal open>Content</Modal>)).toBe('')
  expect(renderToString(<Drawer open title='Filters' />)).toBe('')
  expect(error).not.toHaveBeenCalled()

  error.mockRestore()
})
