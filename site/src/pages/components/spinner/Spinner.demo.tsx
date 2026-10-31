import { Button, Flow, Spinner, Text } from '@lemonade/ui'
import React from 'react'

function SpinnerDemo() {
  return (
    <Flow direction='vertical' gap={1}>
      <Flow direction='horizontal' gap={1.5} alignItems='center'>
        <Spinner />
        <Spinner size={1.5} />
        <Text color='primary'>
          <Spinner size={2} borderWidth={3} />
        </Text>
      </Flow>
      <div role='status'>
        <Flow direction='horizontal' gap={0.5} alignItems='center'>
          <Spinner />
          <Text>Loading orders…</Text>
        </Flow>
      </div>
      <div>
        <Button kind='primary' loading>
          Save
        </Button>
      </div>
    </Flow>
  )
}

export default SpinnerDemo
