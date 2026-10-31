import { Flow, Link, Text, Toggletip } from '@lemonade/ui'
import React from 'react'

function ToggletipDemo() {
  return (
    <Flow direction='horizontal' alignItems='center' gap={0.25} style={{ paddingTop: '7rem' }}>
      <Text fontWeight='bold'>Billing cycle</Text>
      <Toggletip label='About billing cycles'>
        <Text component='p' style={{ margin: 0 }}>
          You are charged on the same day each month. Changing the plan in the middle of a cycle charges only the
          difference. <Link href='#billing'>Learn more about billing</Link>
        </Text>
      </Toggletip>
    </Flow>
  )
}

export default ToggletipDemo
