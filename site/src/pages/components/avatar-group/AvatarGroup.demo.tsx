import { Avatar, AvatarGroup, Flow } from '@lemonade/ui'
import React from 'react'

const team = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Elisa Melo', 'Fábio Cruz', 'Gabi Nunes']

function AvatarGroupDemo() {
  return (
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
}

export default AvatarGroupDemo
