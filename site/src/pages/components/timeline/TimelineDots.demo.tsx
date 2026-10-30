import { Timeline } from '@lemonade/ui'
import React from 'react'

function TimelineDotsDemo() {
  return (
    <Timeline
      aria-label='Activity'
      items={[
        { title: 'Ana Souza changed the status to “Approved”', time: '2 hours ago' },
        { title: 'Bruno Lima left a comment', time: 'Yesterday', description: 'Looks good, just check the address.' },
        { title: 'Payment failed', time: 'Oct 10', type: 'danger', description: 'The card was declined.' },
        { title: 'Ana Souza created the record', time: 'Oct 9' },
      ]}
    />
  )
}

export default TimelineDotsDemo
