import { Button, ConfirmDialogProvider, Flow, Text, useConfirm } from '@lemonade/ui'
import React, { useState } from 'react'

function Orders() {
  const confirm = useConfirm()
  const [message, setMessage] = useState('')

  const remove = async () => {
    const confirmed = await confirm({
      kind: 'danger',
      title: 'Delete this order?',
      description: 'The order #1042 and its history will be deleted for good.',
      confirmLabel: 'Delete order',
      // Stands for the request: the button shows a spinner until it ends
      onConfirm: () => new Promise((resolve) => setTimeout(resolve, 1000)),
    })
    setMessage(confirmed ? 'The order was deleted.' : 'Nothing was deleted.')
  }

  return (
    <Flow direction='vertical' style={{ justifyItems: 'start' }}>
      <Button kind='danger' onClick={() => void remove()}>
        Delete order
      </Button>
      <Text role='status'>{message}</Text>
    </Flow>
  )
}

function ConfirmDialogDemo() {
  return (
    <ConfirmDialogProvider>
      <Orders />
    </ConfirmDialogProvider>
  )
}

export default ConfirmDialogDemo
