import { Button, HFlow, ToastProvider, useToast } from '@lemonade/ui'
import React from 'react'

const files = ['report.pdf', 'budget.xlsx', 'photo.png', 'notes.txt', 'slides.pptx']

function UploadButton() {
  const toast = useToast()

  // Five different messages: three show at once, and the others show as those close
  const handleClick = () => files.forEach((file) => toast.show({ type: 'success', message: `${file} was uploaded.` }))

  return <Button onClick={handleClick}>Upload five files</Button>
}

function ToastQueueDemo() {
  return (
    <ToastProvider>
      <HFlow>
        <UploadButton />
      </HFlow>
    </ToastProvider>
  )
}

export default ToastQueueDemo
