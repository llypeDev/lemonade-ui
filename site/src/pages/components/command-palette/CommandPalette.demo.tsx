import { Button, CommandItem, CommandPalette, Flow, Kbd, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  const items: CommandItem[] = [
    { id: 'home', label: 'Home', group: 'Pages', icon: 'houseOutline', onSelect: () => setMessage('Opened Home') },
    {
      id: 'orders',
      label: 'Orders',
      description: 'Sales › Orders',
      group: 'Pages',
      icon: 'shoppingCartOutline',
      onSelect: () => setMessage('Opened Orders'),
    },
    {
      id: 'customers',
      label: 'Customers',
      description: 'Sales › Customers',
      group: 'Pages',
      icon: 'userOutline',
      onSelect: () => setMessage('Opened Customers'),
    },
    {
      id: 'new-order',
      label: 'New order',
      group: 'Actions',
      icon: 'plus',
      shortcut: ['Ctrl', 'N'],
      onSelect: () => setMessage('Started a new order'),
    },
    {
      id: 'theme',
      label: 'Switch theme',
      group: 'Actions',
      icon: 'lightbulbOutline',
      keywords: ['dark', 'light'],
      onSelect: () => setMessage('Switched the theme'),
    },
  ]

  return (
    <Flow direction='vertical' style={{ justifyItems: 'start' }}>
      <Button onClick={() => setOpen(true)}>Search</Button>
      <Text>
        Or press <Kbd keys={['Ctrl', 'K']} />
      </Text>
      <Text role='status'>{message}</Text>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} />
    </Flow>
  )
}

export default CommandPaletteDemo
