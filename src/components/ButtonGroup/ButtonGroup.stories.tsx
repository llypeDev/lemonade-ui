import React from 'react'

import { Button } from '../Button'
import { HFlow } from '../HFlow'
import { Icon } from '../Icon'

import { ButtonGroup } from './ButtonGroup'

export default {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
}

export const Default = () => (
  <HFlow>
    <ButtonGroup>
      <Button size='small' kind='primary'>
        First
      </Button>
      <Button size='small'>Second</Button>
      <Button size='small' disabled>
        Third
      </Button>
    </ButtonGroup>
    <ButtonGroup aria-label='Item actions'>
      <Button size='small' aria-label='Delete'>
        <Icon icon='trashOutline' />
      </Button>
      <Button size='small' aria-label='Search'>
        <Icon icon='zoomOutline' />
      </Button>
    </ButtonGroup>
  </HFlow>
)
