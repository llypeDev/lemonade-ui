import { Button, Checkbox, Drawer, Flow, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function DrawerDemo() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Filters</Button>
      <Drawer
        open={open}
        onClose={close}
        title='Filters'
        footer={
          <>
            <Button size='small' onClick={close}>
              Clear
            </Button>
            <Button size='small' kind='primary' onClick={close}>
              Apply
            </Button>
          </>
        }
      >
        <Flow direction='vertical'>
          <Text>Show only the orders that match:</Text>
          <Checkbox label='Paid' defaultChecked />
          <Checkbox label='Waiting for payment' />
          <Checkbox label='Shipped' />
          <Checkbox label='Canceled' />
        </Flow>
      </Drawer>
    </>
  )
}

export default DrawerDemo
