import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { ToggleButton } from './ToggleButton'

describe('ToggleButton', () => {
  it('should render correctly', () => {
    const { container } = render(<ToggleButton defaultPressed>Bold</ToggleButton>)
    expect(container).toMatchSnapshot()
  })

  it('should turn on and off when clicked', () => {
    const onPressedChange = jest.fn()
    const { getByRole } = render(<ToggleButton onPressedChange={onPressedChange}>Bold</ToggleButton>)
    const button = getByRole('button', { name: 'Bold' })

    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(onPressedChange).toHaveBeenLastCalledWith(true)

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(onPressedChange).toHaveBeenLastCalledWith(false)
  })

  it('should follow the pressed prop of a controlled button', () => {
    const onPressedChange = jest.fn()
    const { getByRole, rerender } = render(
      <ToggleButton pressed={false} onPressedChange={onPressedChange}>
        Italic
      </ToggleButton>
    )

    fireEvent.click(getByRole('button'))
    expect(onPressedChange).toHaveBeenCalledWith(true)
    expect(getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(<ToggleButton pressed>Italic</ToggleButton>)
    expect(getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('should not toggle when onClick prevents the default', () => {
    const { getByRole } = render(<ToggleButton onClick={(e) => e.preventDefault()}>Bold</ToggleButton>)
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('should pass the button props', () => {
    const { getByRole } = render(
      <ToggleButton aria-label='Bold' skin='ghost' size='small' disabled>
        B
      </ToggleButton>
    )
    expect(getByRole('button', { name: 'Bold' })).toBeDisabled()
  })
})
