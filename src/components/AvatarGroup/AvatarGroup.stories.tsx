import React from 'react'

import { Avatar } from '../Avatar'
import { Flow } from '../Flow'

import { AvatarGroup } from './AvatarGroup'

export default {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
}

const team = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Elisa Melo', 'Fábio Cruz', 'Gabi Nunes']

export const Default = () => (
  <Flow direction='vertical'>
    <AvatarGroup aria-label='Project members' size='small'>
      {team.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
    <AvatarGroup aria-label='Project members'>
      {team.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
    <AvatarGroup aria-label='Project members' size='large' max={3}>
      {team.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  </Flow>
)

export const AllFit = () => (
  <AvatarGroup aria-label='Reviewers'>
    <Avatar name='Ana Souza' />
    <Avatar name='Bruno Lima' />
    <Avatar />
  </AvatarGroup>
)
