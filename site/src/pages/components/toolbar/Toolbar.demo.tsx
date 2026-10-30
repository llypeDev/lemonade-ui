import { Button, Divider, Icon, IconImage, ToggleButton, Toolbar, Tooltip } from '@lemonade/ui'
import React from 'react'

const Toggle = ({ icon, label, pressed }: { icon: IconImage; label: string; pressed?: boolean }) => (
  <Tooltip text={label}>
    <ToggleButton skin='ghost' size='small' aria-label={label} defaultPressed={pressed}>
      <Icon icon={icon} aria-hidden='true' />
    </ToggleButton>
  </Tooltip>
)

function ToolbarDemo() {
  return (
    <Toolbar aria-label='Text formatting'>
      <Toggle icon='bold' label='Bold' pressed />
      <Toggle icon='italic' label='Italic' />
      <Toggle icon='underline' label='Underline' />
      <Divider orientation='vertical' spacing={0.25} />
      <Toggle icon='list' label='Bulleted list' />
      <Divider orientation='vertical' spacing={0.25} />
      <Tooltip text='Insert link'>
        <Button skin='ghost' size='small' aria-label='Insert link'>
          <Icon icon='link' aria-hidden='true' />
        </Button>
      </Tooltip>
    </Toolbar>
  )
}

export default ToolbarDemo
