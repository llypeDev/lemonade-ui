import { action } from '@storybook/addon-actions'
import React from 'react'

import { Button } from '../Button'
import { HFlow } from '../HFlow'
import { Link } from '../Link'
import { VFlow } from '../VFlow'

import { Toast } from './Toast'
import { ToastProvider, useToast } from './ToastProvider'

export default {
  title: 'Components/Toast',
  component: Toast,
}

export const Types = () => (
  <VFlow vSpacing={0.5} style={{ maxWidth: '24rem' }}>
    <Toast type='info' title='New version available' onClose={action('closed')}>
      Reload the page to get the latest features.
    </Toast>
    <Toast type='success' title='Changes saved' onClose={action('closed')}>
      Your profile was updated.
    </Toast>
    <Toast type='warning' title='Storage almost full' onClose={action('closed')}>
      You have used 90% of your space.
    </Toast>
    <Toast type='danger' title='Upload failed' onClose={action('closed')}>
      Check your connection and try again.
    </Toast>
  </VFlow>
)

export const WithAction = () => (
  <div style={{ maxWidth: '24rem' }}>
    <Toast type='success' title='File deleted' action={<Link href='#undo'>Undo</Link>} onClose={action('closed')}>
      report-2026.pdf was moved to the trash.
    </Toast>
  </div>
)

function ToastButtons() {
  const toast = useToast()

  return (
    <HFlow>
      <Button
        size='small'
        onClick={() => toast.show({ type: 'success', title: 'Changes saved', message: 'Your profile was updated.' })}
      >
        Show success
      </Button>
      <Button
        size='small'
        onClick={() =>
          toast.show({
            type: 'danger',
            title: 'Upload failed',
            message: 'Check your connection and try again.',
            action: <Link href='#retry'>Try again</Link>,
            duration: 0,
          })
        }
      >
        Show error that stays open
      </Button>
    </HFlow>
  )
}

export const WithProvider = () => (
  <ToastProvider>
    <ToastButtons />
  </ToastProvider>
)
