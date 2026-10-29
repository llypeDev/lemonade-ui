import React, { useState } from 'react'

import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Drawer } from '../Drawer'
import { Icon } from '../Icon'
import { Link } from '../Link'
import { SideNav, SideNavItem } from '../SideNav'
import { Text } from '../Text'
import { TextField } from '../TextField'
import { Tooltip } from '../Tooltip'

import { AppHeader } from './AppHeader'

export default {
  title: 'Components/AppHeader',
  component: AppHeader,
}

const Logo = () => (
  <Link href='#' style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
    <Icon icon='lemonade' size={1.5} fill='primary' aria-hidden='true' />
    <Text fontWeight='bold' fontSize={1}>
      Lemonade
    </Text>
  </Link>
)

const Actions = () => (
  <>
    <Tooltip text='Notifications'>
      <Badge dot>
        <Button size='small' skin='ghost' aria-label='Notifications'>
          <Icon icon='bellOutline' aria-hidden='true' />
        </Button>
      </Badge>
    </Tooltip>
    <Avatar name='Ana Souza' size='small' />
  </>
)

export const Default = () => (
  <AppHeader logo={<Logo />} actions={<Actions />}>
    <div style={{ width: '100%', maxWidth: '20rem' }}>
      <TextField icon='zoomOutline' placeholder='Search' aria-label='Search' />
    </div>
  </AppHeader>
)

export const WithMenuButton = () => (
  <AppHeader logo={<Logo />} actions={<Actions />} onMenuClick={() => undefined} menuButton='always' />
)

export const WithNavigation = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AppHeader
        logo={<Logo />}
        actions={<Actions />}
        onMenuClick={() => setOpen(!open)}
        menuOpen={open}
        menuControls='app-navigation'
        menuButton='always'
      />
      <Drawer id='app-navigation' open={open} onClose={() => setOpen(false)} placement='left' size='18rem' title='Menu'>
        <SideNav aria-label='Main'>
          <SideNavItem href='#' icon='houseOutline' active>
            Home
          </SideNavItem>
          <SideNavItem href='#' icon='userOutline'>
            Customers
          </SideNavItem>
        </SideNav>
      </Drawer>
    </>
  )
}

WithNavigation.parameters = {
  loki: { skip: true },
}
