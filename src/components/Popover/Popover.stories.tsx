import React, { useState } from 'react'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Flow } from '../Flow'
import { Icon } from '../Icon'
import { Text } from '../Text'

import { Popover } from './Popover'

export default {
  title: 'Components/Popover',
  component: Popover,
}

export const Default = () => {
  const [anchor, setAnchor] = useState<HTMLButtonElement>()
  const [open, setOpen] = useState(true)
  const close = () => setOpen(false)

  return (
    <div style={{ height: '16rem' }}>
      <Button innerRef={setAnchor} size='small' onClick={() => setOpen((state) => !state)}>
        <Icon icon='filterOutline' style={{ marginRight: '0.5rem' }} />
        Filters
      </Button>
      <Popover
        anchorRef={anchor}
        open={open}
        onClose={close}
        aria-labelledby='popover-story-title'
        style={{ width: '16rem' }}
      >
        <Flow direction='vertical'>
          <Text id='popover-story-title' fontWeight='bold' component='p'>
            Order status
          </Text>
          <Checkbox label='Paid' defaultChecked />
          <Checkbox label='Waiting for payment' />
          <Checkbox label='Shipped' />
          <Flow direction='horizontal' justifyContent='flex-end'>
            <Button size='small' skin='ghost' onClick={close}>
              Cancel
            </Button>
            <Button size='small' kind='primary' onClick={close}>
              Apply
            </Button>
          </Flow>
        </Flow>
      </Popover>
    </div>
  )
}

export const Placements = () => {
  const [anchor, setAnchor] = useState<HTMLButtonElement>()

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '20rem' }}>
      <Button innerRef={setAnchor} size='small'>
        Anchor
      </Button>
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Popover key={placement} anchorRef={anchor} open placement={placement} autoFocus={false} aria-label={placement}>
          <Text>{placement}</Text>
        </Popover>
      ))}
    </div>
  )
}
