import React from 'react'

import { Badge } from '../Badge'
import { Button } from '../Button'
import { Flow } from '../Flow'
import { Icon } from '../Icon'
import { Text } from '../Text'

import { VisuallyHidden } from './VisuallyHidden'

export default {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
}

export const IconButton = () => (
  <Flow direction='horizontal' alignItems='center'>
    <Button size='small' skin='ghost'>
      <Icon icon='bellOutline' aria-hidden='true' />
      <VisuallyHidden>Notifications</VisuallyHidden>
    </Button>
    <Text>The button is named “Notifications” for screen readers.</Text>
  </Flow>
)

export const ExtraContext = () => (
  <Flow direction='vertical'>
    <Text component='p'>
      Read more<VisuallyHidden> about the November release</VisuallyHidden>
    </Text>
    <Badge count={3} label='3 unread messages' />
  </Flow>
)
