import { Flow, Icon, ToggleButton } from '@lemonade/ui'
import React, { useState } from 'react'

function ToggleButtonDemo() {
  const [favorite, setFavorite] = useState(false)

  return (
    <Flow direction='horizontal' alignItems='center'>
      <ToggleButton>Show archived</ToggleButton>
      <ToggleButton skin='ghost' size='small' aria-label='Bold' defaultPressed>
        <Icon icon='bold' aria-hidden='true' />
      </ToggleButton>
      <ToggleButton skin='ghost' pressed={favorite} onPressedChange={setFavorite} aria-label='Favorite'>
        <Icon icon={favorite ? 'starFilled' : 'starOutline'} aria-hidden='true' />
      </ToggleButton>
    </Flow>
  )
}

export default ToggleButtonDemo
