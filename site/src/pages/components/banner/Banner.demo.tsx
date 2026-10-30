import { Banner, Button, Flow, Link } from '@lemonade/ui'
import React from 'react'

function BannerDemo() {
  return (
    <Flow direction='vertical' gap={0.5}>
      <Banner title='Scheduled maintenance.' actions={<Link href='#'>Learn more</Link>}>
        The system will be offline on Sunday from 10 PM to 11 PM.
      </Banner>
      <Banner type='success' title='Payment received.'>
        Your plan is active until December 31.
      </Banner>
      <Banner type='alert' title='Your plan expires in 3 days.' actions={<Button size='small'>Renew plan</Button>}>
        Renew it to keep your projects.
      </Banner>
      <Banner type='danger' title='Payment failed.' actions={<Button size='small'>Update card</Button>}>
        We could not charge your card ending in 4242.
      </Banner>
    </Flow>
  )
}

export default BannerDemo
