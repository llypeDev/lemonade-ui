import { Button, Divider, Flow } from '@lemonade/ui'
import React from 'react'

function DividerVerticalDemo() {
  return (
    <Flow direction='horizontal' alignItems='center' gap={0}>
      <Button size='small' skin='ghost'>
        Edit
      </Button>
      <Divider orientation='vertical' spacing={0.5} />
      <Button size='small' skin='ghost'>
        Duplicate
      </Button>
      <Divider orientation='vertical' spacing={0.5} />
      <Button size='small' skin='ghost'>
        Delete
      </Button>
    </Flow>
  )
}

export default DividerVerticalDemo
