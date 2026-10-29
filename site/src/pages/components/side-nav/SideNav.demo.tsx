import { Badge, SideNav, SideNavGroup, SideNavItem } from '@lemonade/ui'
import React from 'react'

function SideNavDemo() {
  return (
    <div style={{ height: '26rem' }}>
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
}

export default SideNavDemo
