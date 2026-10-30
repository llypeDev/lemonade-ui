import { Link, Timeline } from '@lemonade/ui'
import React from 'react'

function TimelineDemo() {
  return (
    <Timeline
      aria-label='Order history'
      items={[
        { title: 'Order placed', time: 'Oct 12, 9:41 AM', dateTime: '2026-10-12T09:41', icon: 'shoppingCartOutline' },
        {
          title: 'Payment approved',
          time: 'Oct 12, 9:43 AM',
          dateTime: '2026-10-12T09:43',
          icon: 'checkDefault',
          type: 'success',
          description: 'Credit card ending in 4242',
        },
        {
          title: 'Shipped',
          time: 'Oct 13, 2:10 PM',
          dateTime: '2026-10-13T14:10',
          icon: 'boxOutline',
          type: 'info',
          description: (
            <>
              Tracking code <Link href='#'>LM123456789BR</Link>
            </>
          ),
        },
        {
          title: 'Delivery delayed',
          time: 'Oct 16, 8:00 AM',
          dateTime: '2026-10-16T08:00',
          icon: 'exclamationTriangleOutline',
          type: 'alert',
        },
      ]}
    />
  )
}

export default TimelineDemo
