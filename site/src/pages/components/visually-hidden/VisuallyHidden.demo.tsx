import { Button, Flow, Icon, Link, Text, VisuallyHidden } from '@lemonade/ui'
import React from 'react'

function VisuallyHiddenDemo() {
  return (
    <Flow direction='vertical'>
      <Flow direction='horizontal' alignItems='center'>
        <Button size='small' skin='ghost'>
          <Icon icon='bellOutline' aria-hidden='true' />
          <VisuallyHidden>Notifications</VisuallyHidden>
        </Button>
        <Text>A screen reader names this button “Notifications”.</Text>
      </Flow>
      <Text>
        <Link href='#'>
          Read more<VisuallyHidden> about the November release</VisuallyHidden>
        </Link>
      </Text>
    </Flow>
  )
}

export default VisuallyHiddenDemo
