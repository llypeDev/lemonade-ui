import { AppHeader, Avatar, Drawer, Icon, Link, SideNav, SideNavItem, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function AppHeaderNavigationDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AppHeader
        logo={
          <Link href='#' style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Icon icon='lemonade' size={1.5} fill='primary' aria-hidden='true' />
            <Text fontWeight='bold' fontSize={1}>
              Lemonade
            </Text>
          </Link>
        }
        actions={<Avatar name='Ana Souza' size='small' />}
        onMenuClick={() => setOpen(!open)}
        menuOpen={open}
        menuControls='app-header-demo-navigation'
        menuButton='always'
      />
      <Drawer
        id='app-header-demo-navigation'
        open={open}
        onClose={() => setOpen(false)}
        placement='left'
        size='18rem'
        title='Menu'
      >
        <SideNav aria-label='Main'>
          <SideNavItem href='#' icon='houseOutline' active>
            Home
          </SideNavItem>
          <SideNavItem href='#' icon='userOutline'>
            Customers
          </SideNavItem>
          <SideNavItem href='#' icon='gearOutline'>
            Settings
          </SideNavItem>
        </SideNav>
      </Drawer>
    </>
  )
}

export default AppHeaderNavigationDemo
