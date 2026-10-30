import React, { useState } from 'react'

import { Button } from '../Button'
import { Flow } from '../Flow'
import { Kbd } from '../Kbd'
import { Text } from '../Text'

import { CommandItem, CommandPalette } from './CommandPalette'

export default {
  title: 'Components/CommandPalette',
  component: CommandPalette,
}

const makeItems = (log: (text: string) => void): CommandItem[] => [
  { id: 'home', label: 'Home', group: 'Pages', icon: 'houseOutline', onSelect: () => log('Opened Home') },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Sales › Orders',
    group: 'Pages',
    icon: 'shoppingCartOutline',
    onSelect: () => log('Opened Orders'),
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Sales › Customers',
    group: 'Pages',
    icon: 'userOutline',
    onSelect: () => log('Opened Customers'),
  },
  {
    id: 'new-order',
    label: 'New order',
    group: 'Actions',
    icon: 'plus',
    shortcut: ['Ctrl', 'N'],
    onSelect: () => log('Started a new order'),
  },
  {
    id: 'theme',
    label: 'Switch theme',
    group: 'Actions',
    icon: 'lightbulbOutline',
    keywords: ['dark', 'light'],
    onSelect: () => log('Switched the theme'),
  },
  {
    id: 'logout',
    label: 'Log out',
    group: 'Actions',
    icon: 'signOut',
    onSelect: () => log('Logged out'),
  },
]

// Page content, so the visual tests capture the open palette over a page
const Page = () => <div style={{ height: 'calc(100vh - 2rem)' }} />

export const Open = () => (
  <>
    <Page />
    <CommandPalette open onOpenChange={() => undefined} items={makeItems(() => undefined)} hotkey={false} />
  </>
)

export const Interactive = () => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <Flow direction='vertical' style={{ justifyItems: 'start' }}>
      <Button onClick={() => setOpen(true)}>Search</Button>
      <Text>
        Or press <Kbd keys={['Ctrl', 'K']} />
      </Text>
      <Text role='status'>{message}</Text>
      <CommandPalette open={open} onOpenChange={setOpen} items={makeItems(setMessage)} />
    </Flow>
  )
}

Interactive.parameters = {
  loki: { skip: true },
}
