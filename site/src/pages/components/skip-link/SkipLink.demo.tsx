import { Button, Flow, Link, SkipLink, Text } from '@lemonade/ui'
import React from 'react'

function SkipLinkDemo() {
  return (
    <Flow direction='vertical'>
      <Text component='p'>
        The skip link is hidden until it gets focus. Focus it with the button, then press Enter to jump past the links.
      </Text>
      <Button
        size='small'
        style={{ justifySelf: 'start' }}
        onClick={() => document.getElementById('skip-link-demo').focus()}
      >
        Focus the skip link
      </Button>
      <SkipLink id='skip-link-demo' target='skip-link-demo-content'>
        Skip to the demo content
      </SkipLink>
      <nav aria-label='Demo'>
        <Flow direction='horizontal'>
          <Link href='#'>Home</Link>
          <Link href='#'>Orders</Link>
          <Link href='#'>Customers</Link>
        </Flow>
      </nav>
      <div id='skip-link-demo-content'>
        <Text component='p'>The skip link moves the focus here, past the links above.</Text>
      </div>
    </Flow>
  )
}

export default SkipLinkDemo
