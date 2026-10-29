import React, { useState } from 'react'

import { Badge } from '../Badge'
import { Text } from '../Text'

import { SideNav } from './SideNav'
import { SideNavGroup } from './SideNavGroup'
import { SideNavItem } from './SideNavItem'

export default {
  title: 'Components/SideNav',
  component: SideNav,
}

export const Default = () => (
  <div style={{ height: '28rem' }}>
    <SideNav aria-label='Main'>
      <SideNavItem href='#home' icon='houseOutline'>
        Home
      </SideNavItem>
      <SideNavItem href='#inbox' icon='inboxOutline' extra={<Badge count={4} label='4 unread' />}>
        Inbox
      </SideNavItem>
      <SideNavGroup title='Sales' icon='shoppingCartOutline'>
        <SideNavItem href='#orders' active>
          Orders
        </SideNavItem>
        <SideNavItem href='#customers'>Customers</SideNavItem>
        <SideNavItem href='#invoices'>Invoices</SideNavItem>
      </SideNavGroup>
      <SideNavGroup title='Reports' icon='fileWithItemsOutline'>
        <SideNavItem href='#monthly'>Monthly</SideNavItem>
        <SideNavItem href='#yearly'>Yearly</SideNavItem>
      </SideNavGroup>
      <SideNavItem href='#settings' icon='gearOutline'>
        Settings
      </SideNavItem>
    </SideNav>
  </div>
)

const pages = ['Home', 'Orders', 'Customers', 'Settings']

export const WithPage = () => {
  const [current, setCurrent] = useState('Orders')

  const item = (page: string, icon?: React.ComponentProps<typeof SideNavItem>['icon']) => (
    <SideNavItem
      href={`#${page.toLowerCase()}`}
      icon={icon}
      active={current === page}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        setCurrent(page)
      }}
    >
      {page}
    </SideNavItem>
  )

  return (
    // The menu sits outside the grid of the page, as the grid guidelines describe
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', height: '24rem' }}>
      <SideNav aria-label='Main'>
        {item(pages[0], 'houseOutline')}
        <SideNavGroup title='Sales' icon='shoppingCartOutline'>
          {item(pages[1])}
          {item(pages[2])}
        </SideNavGroup>
        {item(pages[3], 'gearOutline')}
      </SideNav>
      <main style={{ padding: '1.5rem' }}>
        <Text variant='h1' component='h1'>
          {current}
        </Text>
      </main>
    </div>
  )
}

WithPage.parameters = {
  loki: { skip: true },
}
