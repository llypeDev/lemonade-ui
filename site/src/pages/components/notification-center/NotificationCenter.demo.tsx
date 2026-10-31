import { Link, NotificationCenter, NotificationItem } from '@lemonade/ui'
import React, { useState } from 'react'

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

function NotificationCenterDemo() {
  const [notifications, setNotifications] = useState(initial)

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: '26rem' }}>
      <NotificationCenter
        notifications={notifications}
        onNotificationClick={(clicked) =>
          setNotifications(notifications.map((n) => (n.id === clicked.id ? { ...n, read: true } : n)))
        }
        onMarkAllRead={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
        footer={<Link href='#notifications'>See all notifications</Link>}
      />
    </div>
  )
}

export default NotificationCenterDemo
