import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Icon } from '../Icon'

import { ToggleButton } from './ToggleButton'

export default {
  title: 'Components/ToggleButton',
  component: ToggleButton,
}

export const Default = () => (
  <Flow direction='horizontal' alignItems='center'>
    <ToggleButton>Show archived</ToggleButton>
    <ToggleButton defaultPressed>Show archived</ToggleButton>
    <ToggleButton skin='ghost' size='small' aria-label='Bold'>
      <Icon icon='bold' aria-hidden='true' />
    </ToggleButton>
    <ToggleButton skin='ghost' size='small' aria-label='Italic' defaultPressed>
      <Icon icon='italic' aria-hidden='true' />
    </ToggleButton>
    <ToggleButton disabled>Disabled</ToggleButton>
  </Flow>
)

export const Favorite = () => {
  const [favorite, setFavorite] = useState(false)

  return (
    <ToggleButton skin='ghost' pressed={favorite} onPressedChange={setFavorite} aria-label='Favorite'>
      <Icon icon={favorite ? 'starFilled' : 'starOutline'} aria-hidden='true' />
    </ToggleButton>
  )
}

Favorite.parameters = {
  loki: { skip: true },
}
