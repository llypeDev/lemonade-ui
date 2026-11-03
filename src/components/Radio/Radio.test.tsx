import { render } from '@testing-library/react'
import React from 'react'

import { focusRingStates } from '../../test/utils/resolveStyle'

import { Radio } from './Radio'

it('should render correctly', () => {
  const { container } = render(<Radio label='First' />)
  expect(container).toMatchSnapshot()
})

it('should show the focus ring for the keyboard, not after a click', () => {
  const { container } = render(<Radio label='First' defaultChecked />)
  const input = container.querySelector('input')
  const { received, expected } = focusRingStates(input.nextElementSibling, { on: input })
  expect(received).toEqual(expected)
})
