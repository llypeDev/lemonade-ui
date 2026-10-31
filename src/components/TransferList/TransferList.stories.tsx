import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { TransferList, TransferListItem } from './TransferList'

export default {
  title: 'Components/TransferList',
  component: TransferList,
}

const permissions: TransferListItem[] = [
  { id: 'orders.read', label: 'View orders', description: 'See orders and their history' },
  { id: 'orders.write', label: 'Edit orders', description: 'Change items, prices and addresses' },
  { id: 'payments.refund', label: 'Refund payments' },
  { id: 'reports.export', label: 'Export reports' },
  { id: 'customers.read', label: 'View customers' },
  { id: 'customers.write', label: 'Edit customers' },
  { id: 'users.manage', label: 'Manage users', description: 'Only owners can grant it', disabled: true },
]

export const Default = () => {
  const [granted, setGranted] = useState(['orders.read', 'customers.read'])

  return (
    <Flow direction='vertical' style={{ maxWidth: '44rem' }}>
      <TransferList
        items={permissions}
        value={granted}
        onChange={setGranted}
        sourceLabel='Permissions'
        targetLabel='Granted to Support'
      />
      <Text color='secondary'>Granted: {granted.join(', ') || 'none'}</Text>
    </Flow>
  )
}

export const WithoutSearch = () => (
  <TransferList
    items={['Name', 'Email', 'Plan', 'Created', 'Last order', 'City'].map((label) => ({ id: label, label }))}
    defaultValue={['Name', 'Email']}
    sourceLabel='Hidden columns'
    targetLabel='Visible columns'
    searchable={false}
    listHeight='12rem'
    style={{ maxWidth: '36rem' }}
  />
)
