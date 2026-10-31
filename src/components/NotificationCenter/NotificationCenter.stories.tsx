import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Link } from '../Link'
import { Text } from '../Text'

import { NotificationCenter, NotificationItem } from './NotificationCenter'

export default {
  title: 'Components/NotificationCenter',
  component: NotificationCenter,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '30rem', display: 'flex', justifyContent: 'flex-end', maxWidth: '40rem' }}>
        <Story />
      </div>
    ),
  ],
}

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000)

const initial: NotificationItem[] = [
  {
    id: '1',
    icon: 'checkCircleOutline',
    title: 'Order #1042 was paid',
    description: 'Ana Souza paid R$ 320,00 with a card',
    date: minutesAgo(5),
  },
  {
    id: '2',
    icon: 'chatOutline',
    title: 'New comment on order #1038',
    description: 'Bruno: "Can we ship it today?"',
    date: minutesAgo(70),
  },
  { id: '3', icon: 'download', title: 'Your export is ready', date: minutesAgo(26 * 60), read: true },
]

export const Default = () => {
  const [notifications, setNotifications] = useState(initial)

  return (
    <Flow direction='horizontal' alignItems='center'>
      <Text color='secondary'>Click the bell</Text>
      <NotificationCenter
        notifications={notifications}
        onNotificationClick={(clicked) =>
          setNotifications(notifications.map((n) => (n.id === clicked.id ? { ...n, read: true } : n)))
        }
        onMarkAllRead={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
        footer={<Link href='#notifications'>See all notifications</Link>}
      />
    </Flow>
  )
}

Default.parameters = {
  // The times change with the clock
  loki: { skip: true },
}

export const Empty = () => <NotificationCenter notifications={[]} />
