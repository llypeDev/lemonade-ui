import { Flow, Text, TransferList, TransferListItem } from '@lemonade/ui'
import React, { useState } from 'react'

const permissions: TransferListItem[] = [
  { id: 'orders.read', label: 'View orders', description: 'See orders and their history' },
  { id: 'orders.write', label: 'Edit orders', description: 'Change items, prices and addresses' },
  { id: 'payments.refund', label: 'Refund payments' },
  { id: 'reports.export', label: 'Export reports' },
  { id: 'customers.read', label: 'View customers' },
  { id: 'users.manage', label: 'Manage users', description: 'Only owners can grant it', disabled: true },
]

function TransferListDemo() {
  const [granted, setGranted] = useState(['orders.read'])

  return (
    <Flow direction='vertical'>
      <TransferList
        items={permissions}
        value={granted}
        onChange={setGranted}
        sourceLabel='Permissions'
        targetLabel='Granted to Support'
        listHeight='12rem'
      />
      <Text color='secondary'>Granted: {granted.join(', ') || 'none'}</Text>
    </Flow>
  )
}

export default TransferListDemo
