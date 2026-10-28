import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Avatar, getInitials } from './Avatar'

describe('Avatar', () => {
  it('should render correctly', () => {
    const { container } = render(<Avatar name='Ana Souza' />)
    expect(container).toMatchSnapshot()
  })

  it('should show the image with the name as alternative text', () => {
    const { getByRole } = render(<Avatar src='ana.png' name='Ana Souza' />)
    expect(getByRole('img', { name: 'Ana Souza' }).tagName).toBe('IMG')
  })

  it('should show the initials when the image fails to load', () => {
    const { container, getByRole, getByText } = render(<Avatar src='broken.png' name='Ana Souza' />)

    fireEvent.error(container.querySelector('img'))

    expect(container.querySelector('img')).toBeNull()
    expect(getByRole('img', { name: 'Ana Souza' })).toBeInTheDocument()
    expect(getByText('AS')).toBeInTheDocument()
  })

  it('should try a new image after one fails', () => {
    const { container, rerender } = render(<Avatar src='broken.png' name='Ana Souza' />)

    fireEvent.error(container.querySelector('img'))
    rerender(<Avatar src='ana.png' name='Ana Souza' />)

    expect(container.querySelector('img')).toHaveAttribute('src', 'ana.png')
  })

  it('should show a decorative icon without a name', () => {
    const { container, queryByRole } = render(<Avatar />)

    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(queryByRole('img')).toBeNull()
  })

  it('should accept the size and other span props', () => {
    const { container } = render(<Avatar name='Ana' size='large' data-testid='avatar' />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'avatar')
  })
})

describe('getInitials', () => {
  it('should take the first letter of the first and last words', () => {
    expect(getInitials('ana maria souza')).toBe('AS')
    expect(getInitials('  Ana  ')).toBe('A')
    expect(getInitials('élio lima')).toBe('ÉL')
  })

  it('should return an empty string without a name', () => {
    expect(getInitials(undefined)).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})
