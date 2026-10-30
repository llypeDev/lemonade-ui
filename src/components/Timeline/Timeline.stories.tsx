import React from 'react'

import { Card } from '../Card'
import { Flow } from '../Flow'
import { Heading } from '../Heading'
import { Link } from '../Link'

import { Timeline } from './Timeline'

export default {
  title: 'Components/Timeline',
  component: Timeline,
}

export const WithIcons = () => (
  <Card style={{ maxWidth: '28rem' }}>
    <Flow direction='vertical'>
      <Heading level={3} fontWeight='bold'>
        Order #1042
      </Heading>
      <Timeline
        aria-label='Order history'
        items={[
          { title: 'Order placed', time: 'Oct 12, 9:41 AM', icon: 'shoppingCartOutline' },
          {
            title: 'Payment approved',
            time: 'Oct 12, 9:43 AM',
            icon: 'checkDefault',
            type: 'success',
            description: 'Credit card ending in 4242',
          },
          {
            title: 'Shipped',
            time: 'Oct 13, 2:10 PM',
            icon: 'boxOutline',
            type: 'info',
            description: (
              <>
                Tracking code <Link href='#'>LM123456789BR</Link>
              </>
            ),
          },
          { title: 'Delivery delayed', time: 'Oct 16, 8:00 AM', icon: 'exclamationTriangleOutline', type: 'alert' },
        ]}
      />
    </Flow>
  </Card>
)

export const WithDots = () => (
  <div style={{ maxWidth: '28rem' }}>
    <Timeline
      items={[
        { title: 'Ana Souza changed the status to “Approved”', time: '2 hours ago' },
        { title: 'Bruno Lima left a comment', time: 'Yesterday', description: 'Looks good, just check the address.' },
        { title: 'Payment failed', time: 'Oct 10', type: 'danger', description: 'The card was declined.' },
        { title: 'Ana Souza created the record', time: 'Oct 9' },
      ]}
    />
  </div>
)
