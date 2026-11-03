import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { focusRingStates } from '../../test/utils/resolveStyle'

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

  describe('open and close', () => {
    const { matchMedia } = window
    afterEach(() => {
      window.matchMedia = matchMedia
      jest.restoreAllMocks()
    })
    const prefersReducedMotion = (reduce: boolean) => {
      window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
    }

    it('should slide the items of a group open', () => {
      prefersReducedMotion(false)
      // jsdom has no layout: the items of the group take 80px
      jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(80)
      const { getByRole, getByText } = renderNav()
      const list = getByText('Users').closest('ul')

      fireEvent.click(getByRole('button', { name: 'Settings' }))
      expect(list).not.toHaveAttribute('hidden')
      expect(list.style.height).toBe('80px')
      expect(list.style.transition).toBe('height 200ms ease')

      fireEvent.transitionEnd(list)
      expect(list.style.height).toBe('')
      expect(getByText('Users')).toBeVisible()
    })

    it('should keep the items of a group shown while it closes, and hide them at the end', () => {
      prefersReducedMotion(false)
      const { getByRole, getByText } = renderNav()
      const header = getByRole('button', { name: 'Reports' })
      const list = getByText('Sales').closest('ul')

      fireEvent.click(header)
      expect(header).toHaveAttribute('aria-expanded', 'false')
      expect(list).not.toHaveAttribute('hidden')
      expect(list.style.height).toBe('0px')

      fireEvent.transitionEnd(list)
      expect(list).toHaveAttribute('hidden')
      expect(list.style.height).toBe('')
      expect(getByText('Sales')).not.toBeVisible()
    })

    it('should hide the items of a group at once with reduced motion', () => {
      prefersReducedMotion(true)
      const { getByRole, getByText } = renderNav()

      fireEvent.click(getByRole('button', { name: 'Reports' }))
      expect(getByText('Sales').closest('ul')).toHaveAttribute('hidden')
      expect(getByText('Sales').closest('ul').style.height).toBe('')
    })
  })
})

it('should show the focus ring for the keyboard and keep the mark of the current item after a click', () => {
  const { getByRole } = render(
    <SideNav aria-label='Main'>
      <SideNavItem href='/orders' active>
        Orders
      </SideNavItem>
      <SideNavItem href='/users'>Users</SideNavItem>
      <SideNavGroup title='Reports'>
        <SideNavItem href='/sales'>Sales</SideNavItem>
      </SideNavGroup>
    </SideNav>
  )

  ;[
    getByRole('link', { name: 'Orders' }),
    getByRole('link', { name: 'Users' }),
    getByRole('button', { name: 'Reports' }),
  ].forEach((item) => {
    const { received, expected } = focusRingStates(item)
    expect(received).toEqual(expected)
  })
})
