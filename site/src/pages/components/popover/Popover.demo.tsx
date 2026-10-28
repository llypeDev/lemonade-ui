import { Button, Checkbox, Flow, Icon, Popover, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function PopoverDemo() {
  const [anchor, setAnchor] = useState<HTMLButtonElement>()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <Button innerRef={setAnchor} size='small' onClick={() => setOpen((state) => !state)}>
        <Icon icon='filterOutline' style={{ marginRight: '0.5rem' }} />
        Filters
      </Button>
      <Popover
        anchorRef={anchor}
        open={open}
        onClose={close}
        aria-labelledby='popover-demo-title'
        style={{ width: '16rem' }}
      >
        <Flow direction='vertical'>
          <Text id='popover-demo-title' fontWeight='bold' component='p'>
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
    </>
  )
}

export default PopoverDemo
