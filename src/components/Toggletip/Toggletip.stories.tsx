import React from 'react'

import { Flow } from '../Flow'
import { Link } from '../Link'
import { Text } from '../Text'

import { Toggletip } from './Toggletip'

export default {
  title: 'Components/Toggletip',
  component: Toggletip,
  decorators: [
    (Story) => (
      <div style={{ paddingTop: '8rem' }}>
        <Story />
      </div>
    ),
  ],
}

export const Default = () => (
  <Flow direction='horizontal' alignItems='center' gap={0.25}>
    <Text fontWeight='bold'>Billing cycle</Text>
    <Toggletip label='About billing cycles'>
      <Text component='p' style={{ margin: 0 }}>
        You are charged on the same day each month. Changing the plan in the middle of a cycle charges only the
        difference. <Link href='#billing'>Learn more about billing</Link>
      </Text>
    </Toggletip>
  </Flow>
)

export const Placements = () => (
  <Flow direction='horizontal' alignItems='center'>
    <Toggletip placement='top'>Opens on the top</Toggletip>
    <Toggletip placement='right'>Opens on the right</Toggletip>
    <Toggletip placement='bottom' icon='exclamationTriangleOutline'>
      A warning icon fits notes about risks
    </Toggletip>
  </Flow>
)
