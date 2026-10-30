import React, { useState } from 'react'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Flow } from '../Flow'
import { Text } from '../Text'

import { ConfirmDialog } from './ConfirmDialog'
import { ConfirmDialogProvider, useConfirm } from './useConfirm'

export default {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
}

// Page content, so the visual tests capture the open dialog over a page
const Page = () => <div style={{ height: 'calc(100vh - 2rem)' }} />

export const Danger = () => (
  <>
    <Page />
    <ConfirmDialog
      open
      kind='danger'
      title='Delete this order?'
      description='The order #1042 and its history will be deleted for good.'
      confirmLabel='Delete order'
      onConfirm={() => undefined}
      onCancel={() => undefined}
    />
  </>
)

export const WithContent = () => (
  <>
    <Page />
    <ConfirmDialog
      open
      icon={{ name: 'exclamationTriangleOutline', fill: 'alert' }}
      title='Publish the changes?'
      description='Everyone with access to the page will see the new version.'
      confirmLabel='Publish'
      onConfirm={() => undefined}
      onCancel={() => undefined}
    >
      <Checkbox label='Notify the subscribers by email' defaultChecked />
    </ConfirmDialog>
  </>
)

const Orders = () => {
  const confirm = useConfirm()
  const [message, setMessage] = useState('')

  const remove = async () => {
    const confirmed = await confirm({
      kind: 'danger',
      title: 'Delete this order?',
      description: 'The order #1042 and its history will be deleted for good.',
      confirmLabel: 'Delete order',
      // Simulates the request, so the button shows the spinner
      onConfirm: () => new Promise((resolve) => setTimeout(resolve, 1000)),
    })
    setMessage(confirmed ? 'The order was deleted.' : 'Nothing was deleted.')
  }

  return (
    <Flow direction='vertical' style={{ justifyItems: 'start' }}>
      {/* Not returning the promise keeps the button without its own spinner while the dialog is open */}
      <Button kind='danger' onClick={() => void remove()}>
        Delete order
      </Button>
      <Text role='status'>{message}</Text>
    </Flow>
  )
}

export const WithHook = () => (
  <ConfirmDialogProvider>
    <Orders />
  </ConfirmDialogProvider>
)

WithHook.parameters = {
  loki: { skip: true },
}
