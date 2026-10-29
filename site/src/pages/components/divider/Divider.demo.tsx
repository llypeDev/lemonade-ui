import { Button, Divider, Flow, Text } from '@lemonade/ui'
import React from 'react'

function DividerDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <div>
        <Text component='p'>Account details</Text>
        <Divider />
        <Text component='p'>Payment methods</Text>
      </div>
      <Button kind='primary' block>
        Sign in with email
      </Button>
      <Divider label='or' spacing={0.5} />
      <Button block>Sign in with a single sign-on account</Button>
    </Flow>
  )
}

export default DividerDemo
