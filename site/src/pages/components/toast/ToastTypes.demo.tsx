import { Toast, VFlow } from '@lemonade/ui'
import React from 'react'

function ToastTypesDemo() {
  return (
    <VFlow vSpacing={0.5} style={{ maxWidth: '24rem' }}>
      <Toast type='info' title='New version available'>
        Reload the page to get the latest features.
      </Toast>
      <Toast type='success' title='Changes saved'>
        Your profile was updated.
      </Toast>
      <Toast type='warning' title='Storage almost full'>
        You have used 90% of your space.
      </Toast>
      <Toast type='danger' title='Upload failed'>
        Check your connection and try again.
      </Toast>
    </VFlow>
  )
}

export default ToastTypesDemo
