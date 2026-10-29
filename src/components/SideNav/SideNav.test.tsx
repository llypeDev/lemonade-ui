import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { SideNav } from './SideNav'
import { SideNavGroup } from './SideNavGroup'
import { SideNavItem } from './SideNavItem'

jest.mock('../../util/string')

const renderNav = () =>
  render(
    <SideNav aria-label='Main'>
      <SideNavItem href='/home' icon='houseOutline'>
        Home
      </SideNavItem>
      <SideNavGroup title='Reports'>
        <SideNavItem href='/reports/sales' active>
          Sales
        </SideNavItem>
        <SideNavItem href='/reports/stock'>Stock</SideNavItem>
      </SideNavGroup>
      <SideNavGroup title='Settings'>
        <SideNavItem href='/settings/users'>Users</SideNavItem>
      </SideNavGroup>
    </SideNav>
  )

describe('SideNav', () => {
  it('should render correctly', () => {
    const { container } = renderNav()
    expect(container).toMatchSnapshot()
  })

  it('should be a named navigation landmark with links', () => {
    const { getByRole } = renderNav()

    expect(getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home')
  })

  it('should mark the active item as the current page', () => {
    const { getByRole } = renderNav()

    expect(getByRole('link', { name: 'Sales' })).toHaveAttribute('aria-current', 'page')
    expect(getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('should expand the group of the active item and collapse the others', () => {
    const { getByRole, getByText } = renderNav()

    expect(getByRole('button', { name: 'Reports' })).toHaveAttribute('aria-expanded', 'true')
    expect(getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'false')
    expect(getByText('Users')).not.toBeVisible()
  })

  it('should toggle a group and link it to its items', () => {
    const { getByRole, getByText } = renderNav()
    const header = getByRole('button', { name: 'Settings' })

    fireEvent.click(header)

    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(getByText('Users')).toBeVisible()
    // Ids are fixed by the randomStr mock, so check the link through the attribute itself
    expect(header).toHaveAttribute('aria-controls', getByText('Users').closest('ul').id)
  })

  it('should respect defaultExpanded over the active item', () => {
    const { getByRole } = render(
      <SideNav aria-label='Main'>
        <SideNavGroup title='Reports' defaultExpanded={false}>
          <SideNavItem href='/sales' active>
            Sales
          </SideNavItem>
        </SideNavGroup>
      </SideNav>
    )
    expect(getByRole('button', { name: 'Reports' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render items with a custom component', () => {
    const RouterLink = (props: { to: string; className?: string; children?: React.ReactNode }) => (
      <a href={`#${props.to}`} className={props.className}>
        {props.children}
      </a>
    )

    const { getByRole } = render(
      <SideNav aria-label='Main'>
        <SideNavItem component={RouterLink} to='/orders'>
          Orders
        </SideNavItem>
      </SideNav>
    )
    expect(getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '#/orders')
  })

  it('should show extra content at the end of an item', () => {
    const { getByText } = render(
      <SideNav aria-label='Main'>
        <SideNavItem href='/inbox' extra={<span>4</span>}>
          Inbox
        </SideNavItem>
      </SideNav>
    )
    expect(getByText('4')).toBeInTheDocument()
  })
})
