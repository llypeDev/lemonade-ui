import { Flow, InfoLabel } from '@lemonade/ui'
import React from 'react'

function InfoLabelDemo() {
  return (
    <Flow direction='horizontal' gap={2}>
      <InfoLabel title='Name'>Ana Souza</InfoLabel>
      <InfoLabel title='Email'>ana@example.com</InfoLabel>
      <InfoLabel title='Phone' placeholder='Not informed' />
    </Flow>
  )
}

export default InfoLabelDemo
