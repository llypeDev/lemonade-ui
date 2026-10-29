import { CopyButton, Flow, Text } from '@lemonade/ui'
import React from 'react'

function CopyButtonDemo() {
  return (
    <Flow direction='vertical'>
      <Flow direction='horizontal' alignItems='center'>
        <CopyButton text='npm install @lemonade/ui'>Copy command</CopyButton>
        <CopyButton text='https://lemonade-ui.llypedev.com.br' kind='primary'>
          Copy link
        </CopyButton>
      </Flow>
      <Flow direction='horizontal' alignItems='center' gap={0.5}>
        <Text component='code'>LMN-4F7Q-92KD</Text>
        <CopyButton text='LMN-4F7Q-92KD' size='small' skin='ghost' />
      </Flow>
    </Flow>
  )
}

export default CopyButtonDemo
