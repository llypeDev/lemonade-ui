import { Button, HFlow, Link, ToastProvider, useToast } from '@lemonade/ui'
import React from 'react'

function SaveButton() {
  const toast = useToast()

  const handleClick = () =>
    toast.show({
      type: 'success',
      title: 'Changes saved',
      message: 'Your profile was updated.',
      action: <Link href='#history'>See history</Link>,
    })

  return (
    <Button kind='primary' onClick={handleClick}>
      Save
    </Button>
  )
}

function ToastProviderDemo() {
  // Wrap your app once with ToastProvider, then call useToast anywhere inside it
  return (
    <ToastProvider>
      <HFlow>
        <SaveButton />
      </HFlow>
    </ToastProvider>
  )
}

export default ToastProviderDemo
