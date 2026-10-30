import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { Toolbar } from './Toolbar'

const renderToolbar = (props: Partial<React.ComponentProps<typeof Toolbar>> = {}) =>
  render(
    <>
      <button>Before</button>
      <Toolbar aria-label='Formatting' {...props}>
        <button>Bold</button>
        <button>Italic</button>
        <button disabled>Underline</button>
        <input aria-label='Font size' />
        <button>Link</button>
      </Toolbar>
    </>
  )

describe('Toolbar', () => {
  it('should render correctly', () => {
    const { container } = renderToolbar()
    expect(container).toMatchSnapshot()
  })

  it('should be a toolbar named by aria-label', () => {
    const { getByRole } = renderToolbar()
    expect(getByRole('toolbar', { name: 'Formatting' })).not.toHaveAttribute('aria-orientation')
  })

  it('should keep only one item in the tab order', () => {
    const { getByRole } = renderToolbar()

    expect(getByRole('button', { name: 'Bold' })).toHaveAttribute('tabindex', '0')
    expect(getByRole('button', { name: 'Italic' })).toHaveAttribute('tabindex', '-1')
    expect(getByRole('textbox', { name: 'Font size' })).toHaveAttribute('tabindex', '-1')
    expect(getByRole('button', { name: 'Before' })).not.toHaveAttribute('tabindex')
  })

  it('should move between the items with the arrow keys, skipping disabled ones', () => {
    const { getByRole } = renderToolbar()
    const bold = getByRole('button', { name: 'Bold' })
    const italic = getByRole('button', { name: 'Italic' })
    const fontSize = getByRole('textbox', { name: 'Font size' })
    const link = getByRole('button', { name: 'Link' })

    bold.focus()
    fireEvent.keyDown(bold, { key: 'ArrowRight' })
    expect(italic).toHaveFocus()
    expect(italic).toHaveAttribute('tabindex', '0')
    expect(bold).toHaveAttribute('tabindex', '-1')

    fireEvent.keyDown(italic, { key: 'ArrowRight' })
    expect(fontSize).toHaveFocus()

    fireEvent.keyDown(fontSize, { key: 'Tab' })
    fireEvent.keyDown(fontSize, { key: 'End' })
    expect(fontSize).toHaveFocus()

    link.focus()
    fireEvent.keyDown(link, { key: 'ArrowRight' })
    expect(bold).toHaveFocus()

    fireEvent.keyDown(bold, { key: 'ArrowLeft' })
    expect(link).toHaveFocus()

    fireEvent.keyDown(link, { key: 'Home' })
    expect(bold).toHaveFocus()

    fireEvent.keyDown(bold, { key: 'End' })
    expect(link).toHaveFocus()
  })

  it('should remember the item focused by a click', () => {
    const { getByRole } = renderToolbar()
    const italic = getByRole('button', { name: 'Italic' })

    fireEvent.focus(italic)
    expect(italic).toHaveAttribute('tabindex', '0')
    expect(getByRole('button', { name: 'Bold' })).toHaveAttribute('tabindex', '-1')
  })

  it('should use the up and down arrows when vertical', () => {
    const { getByRole } = renderToolbar({ orientation: 'vertical' })
    const bold = getByRole('button', { name: 'Bold' })

    expect(getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical')

    bold.focus()
    fireEvent.keyDown(bold, { key: 'ArrowRight' })
    expect(bold).toHaveFocus()

    fireEvent.keyDown(bold, { key: 'ArrowDown' })
    expect(getByRole('button', { name: 'Italic' })).toHaveFocus()
  })

  it('should follow items added later', () => {
    const Dynamic = () => {
      const [extra, setExtra] = useState(false)
      return (
        <Toolbar aria-label='Actions'>
          <button onClick={() => setExtra(true)}>Add</button>
          {extra && <button>New</button>}
        </Toolbar>
      )
    }
    const { getByRole } = render(<Dynamic />)

    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('button', { name: 'New' })).toHaveAttribute('tabindex', '-1')
  })
})
