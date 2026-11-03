import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Link } from '../Link'
import { focusRingStates } from '../../test/utils/resolveStyle'

import { DropdownItem } from './DropdownItem'

it('should render correctly', () => {
  const { container } = render(<DropdownItem>Item</DropdownItem>)
  expect(container).toMatchSnapshot()
})

it('should accept "component" prop to render with different container elements', () => {
  const { container: container1 } = render(
    <DropdownItem component='a' href='/'>
      Item
    </DropdownItem>
  )
  expect(container1).toMatchSnapshot()

  const { container: container2 } = render(
    <DropdownItem component={Link} href='/'>
      Item
    </DropdownItem>
  )
  expect(container2).toMatchSnapshot()
})

describe('onClick', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    const { container } = render(<DropdownItem onClick={handleClick}>Item</DropdownItem>)
    fireEvent.click(container.querySelector('li'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should NOT call onClick when disabled', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <DropdownItem onClick={handleClick} disabled>
        Item
      </DropdownItem>
    )
    fireEvent.click(container.querySelector('li'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should call onClick when focused and Enter is pressed', () => {
    const handleClick = jest.fn()
    const { container } = render(<DropdownItem onClick={handleClick}>Item</DropdownItem>)
    fireEvent.focus(container.querySelector('li'))
    fireEvent.keyDown(container.querySelector('li'), { key: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })

  it('should call onClick when focused and Spacebar is pressed', () => {
    const handleClick = jest.fn()
    const { container } = render(<DropdownItem onClick={handleClick}>Item</DropdownItem>)
    fireEvent.focus(container.querySelector('li'))
    fireEvent.keyDown(container.querySelector('li'), { key: ' ' })
    expect(handleClick).toHaveBeenCalled()
  })
})

it('should show the focus ring for the keyboard and keep the square corners after a click', () => {
  const { getByText } = render(
    <ul>
      <DropdownItem>Edit</DropdownItem>
      <DropdownItem type='danger'>Delete</DropdownItem>
    </ul>
  )

  ;[getByText('Edit'), getByText('Delete')].forEach((text) => {
    const item = text.closest('li')
    ;['box-shadow', 'border-radius'].forEach((property) => {
      const { received, expected } = focusRingStates(item, { property })
      expect(received).toEqual(expected)
    })
  })
})
