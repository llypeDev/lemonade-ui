import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  it('should render correctly', () => {
    const { container } = render(
      <AppHeader logo={<a href='/'>Lemonade</a>} actions={<button>Profile</button>} onMenuClick={jest.fn()}>
        <input aria-label='Search' />
      </AppHeader>
    )
    expect(container).toMatchSnapshot()
  })

  it('should be the banner landmark of the page', () => {
    const { getByRole } = render(<AppHeader logo='Lemonade' />)
    expect(getByRole('banner')).toHaveTextContent('Lemonade')
  })

  it('should not render the menu button without onMenuClick', () => {
    const { queryByRole } = render(<AppHeader logo='Lemonade' />)
    expect(queryByRole('button')).toBeNull()
  })

  it('should call onMenuClick and tell whether the menu is open', () => {
    const onMenuClick = jest.fn()
    const { getByRole, rerender } = render(
      <AppHeader logo='Lemonade' onMenuClick={onMenuClick} menuControls='navigation' />
    )
    const button = getByRole('button', { name: 'Open menu' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls', 'navigation')

    fireEvent.click(button)
    expect(onMenuClick).toHaveBeenCalledTimes(1)

    rerender(<AppHeader logo='Lemonade' onMenuClick={onMenuClick} menuControls='navigation' menuOpen />)
    expect(getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('should render the content and the actions', () => {
    const { getByRole } = render(
      <AppHeader logo='Lemonade' actions={<button>Notifications</button>}>
        <input aria-label='Search' />
      </AppHeader>
    )
    expect(getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('should pass other props to the header', () => {
    const { getByRole } = render(<AppHeader logo='Lemonade' id='top' />)
    expect(getByRole('banner')).toHaveAttribute('id', 'top')
  })
})
