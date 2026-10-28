import React from 'react'

import { Badge } from '../Badge'
import { Flow } from '../Flow'

import { Avatar } from './Avatar'

export default {
  title: 'Components/Avatar',
  component: Avatar,
}

// Inline picture, so the story does not depend on the network
const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#F5C342"/>
      <circle cx="32" cy="26" r="12" fill="#8A5A2B"/>
      <path d="M10 64c2-14 11-20 22-20s20 6 22 20z" fill="#2F6FDE"/>
    </svg>`
  )

export const Default = () => (
  <Flow direction='horizontal' alignItems='center'>
    <Avatar name='Ana Souza' size='small' />
    <Avatar name='Ana Souza' />
    <Avatar name='Ana Souza' size='large' />
  </Flow>
)

export const WithImage = () => (
  <Flow direction='horizontal' alignItems='center'>
    <Avatar src={photo} name='Bruno Lima' size='small' />
    <Avatar src={photo} name='Bruno Lima' />
    <Avatar src={photo} name='Bruno Lima' size='large' />
  </Flow>
)

// An image that fails to load without a network request
const brokenImage = 'data:image/png;base64,AAAA'

export const Fallbacks = () => (
  <Flow direction='horizontal' alignItems='center'>
    <Avatar src={brokenImage} name='Carla Dias' />
    <Avatar name='Diego' />
    <Avatar />
  </Flow>
)

export const WithBadge = () => (
  <Flow direction='horizontal' alignItems='center'>
    <Badge dot type='success' overlap='circular' label='Online'>
      <Avatar src={photo} name='Bruno Lima' />
    </Badge>
    <Badge count={4} overlap='circular' label='4 new messages'>
      <Avatar name='Ana Souza' size='large' />
    </Badge>
  </Flow>
)
