import { Button, ButtonGroup, Flow, Icon } from '@lemonade/ui'
import React from 'react'

function ButtonGroupDemo() {
  return (
    <Flow direction='horizontal' gap={1}>
      <ButtonGroup aria-label='History'>
        <Button size='small'>Undo</Button>
        <Button size='small'>Redo</Button>
      </ButtonGroup>
      <ButtonGroup aria-label='Zoom'>
        <Button size='small' aria-label='Zoom out'>
          <Icon icon='minus' />
        </Button>
        <Button size='small' aria-label='Zoom in'>
          <Icon icon='plus' />
        </Button>
      </ButtonGroup>
    </Flow>
  )
}

export default ButtonGroupDemo
