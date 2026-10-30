import { render } from '@testing-library/react'
import React from 'react'

import { Kbd } from './Kbd'

describe('Kbd', () => {
  it('should render correctly', () => {
    const { container } = render(<Kbd keys={['Ctrl', 'K']} />)
    expect(container).toMatchSnapshot()
  })

  it('should render a single key', () => {
    const { container } = render(<Kbd>Esc</Kbd>)
    const kbd = container.querySelector('kbd')

    expect(kbd).toHaveTextContent('Esc')
    expect(kbd.querySelectorAll('kbd')).toHaveLength(0)
  })

  it('should nest a kbd for each key of a shortcut', () => {
    const { container } = render(<Kbd keys={['Ctrl', 'Shift', 'P']} />)
    const outer = container.firstElementChild

    expect(outer.tagName).toBe('KBD')
    expect(outer.querySelectorAll('kbd')).toHaveLength(3)
    expect(outer).toHaveTextContent('Ctrl+Shift+P')
  })

  it('should use the separator given', () => {
    const { container } = render(<Kbd keys={['⌘', 'K']} separator=' ' />)
    expect(container.firstElementChild.querySelectorAll('kbd')).toHaveLength(2)
    expect(container).toHaveTextContent('⌘ K')
  })
})
