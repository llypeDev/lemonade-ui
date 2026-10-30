import { Button, Checkbox, ConfirmDialog } from '@lemonade/ui'
import React, { useState } from 'react'

function ConfirmDialogComponentDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button kind='primary' onClick={() => setOpen(true)}>
        Publish
      </Button>
      <ConfirmDialog
        open={open}
        icon={{ name: 'exclamationTriangleOutline', fill: 'alert' }}
        title='Publish the changes?'
        description='Everyone with access to the page will see the new version.'
        confirmLabel='Publish'
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <Checkbox label='Notify the subscribers by email' defaultChecked />
      </ConfirmDialog>
    </>
  )
}

export default ConfirmDialogComponentDemo
