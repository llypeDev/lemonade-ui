import React from 'react'

import { Button } from '../Button'
import { Flow } from '../Flow'
import { Text } from '../Text'

import { Divider } from './Divider'

export default {
  title: 'Components/Divider',
  component: Divider,
}

export const Default = () => (
  <div style={{ maxWidth: '24rem' }}>
    <Text component='p'>Account details</Text>
    <Divider />
    <Text component='p'>Payment methods</Text>
  </div>
)

export const WithLabel = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <Button kind='primary' block>
      Sign in with email
    </Button>
    <Divider label='or' spacing={0.5} />
    <Button block>Sign in with a single sign-on account</Button>
  </Flow>
)

export const Vertical = () => (
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
