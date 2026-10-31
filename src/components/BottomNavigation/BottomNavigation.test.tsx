import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { BottomNavigation, BottomNavigationItem } from './BottomNavigation'

const items: BottomNavigationItem[] = [
  { id: 'home', label: 'Home', icon: 'houseOutline', href: '/' },
  { id: 'orders', label: 'Orders', icon: 'fileEmptyOutline', href: '/orders', badge: 3 },
  { id: 'profile', label: 'Profile', icon: 'userOutline', href: '/profile' },
]

describe('BottomNavigation', () => {
  it('should render correctly', () => {
    const { container } = render(<BottomNavigation items={items} active='orders' />)
    expect(container).toMatchSnapshot()
  })

  it('should be a navigation with links and mark the current one', () => {
    const { getByRole } = render(<BottomNavigation items={items} active='home' />)

    expect(getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(getByRole('link', { name: 'Profile' })).not.toHaveAttribute('aria-current')
    expect(getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile')
  })

  it('should say the number of the badge in the name', () => {
    const { getByRole } = render(<BottomNavigation items={items} />)
    const orders = getByRole('link', { name: /^Orders\s*, 3$/ })
    expect(orders).toHaveTextContent('3')
  })

  it('should render buttons without href and call onClick', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <BottomNavigation items={[{ id: 'menu', label: 'Menu', icon: 'hamburguerMenu', onClick }]} />
    )
    fireEvent.click(getByRole('button', { name: 'Menu' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should render another component with its props', () => {
    const RouterLink = (props: { to: string; children?: React.ReactNode }) => <a href={props.to}>{props.children}</a>
    const { getByRole } = render(
      <BottomNavigation
        items={[{ id: 'home', label: 'Home', icon: 'houseOutline', component: RouterLink, to: '/home' }]}
      />
    )
    expect(getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home')
  })

  it('should take a name and the locale strings', () => {
    const { getByRole, rerender } = render(<BottomNavigation items={items} label='Sections' />)
    expect(getByRole('navigation', { name: 'Sections' })).toBeInTheDocument()

    rerender(
      <LocaleContext.Provider value={ptBR}>
        <BottomNavigation items={items} />
      </LocaleContext.Provider>
    )
    expect(getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })
})
