import { Button, Drawer, DrawerPlacement, Flow, Text } from '@lemonade/ui'
import React, { useState } from 'react'

const placements: DrawerPlacement[] = ['left', 'right', 'top', 'bottom']

function DrawerPlacementDemo() {
  const [placement, setPlacement] = useState<DrawerPlacement>()

  return (
    <>
      <Flow direction='horizontal'>
        {placements.map((value) => (
          <Button key={value} size='small' onClick={() => setPlacement(value)}>
            Open {value}
          </Button>
        ))}
      </Flow>
      <Drawer open={!!placement} placement={placement} title='Menu' onClose={() => setPlacement(undefined)}>
        <Text>This drawer comes from the {placement}.</Text>
      </Drawer>
    </>
  )
}

export default DrawerPlacementDemo
