import { Avatar, Flow } from '@lemonade/ui'
import React from 'react'

function AvatarDemo() {
  return (
    <Flow direction='horizontal' alignItems='center'>
      <Avatar name='Ana Souza' size='small' />
      <Avatar name='Ana Souza' />
      <Avatar name='Ana Souza' size='large' />
      <Avatar src='https://github.com/llypeDev.png' name='llypeDev' size='large' />
      <Avatar />
    </Flow>
  )
}

export default AvatarDemo
