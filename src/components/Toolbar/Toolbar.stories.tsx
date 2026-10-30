import React from 'react'

import { Button } from '../Button'
import { Divider } from '../Divider'
import { Icon, IconImage } from '../Icon'
import { Text } from '../Text'
import { ToggleButton } from '../ToggleButton'
import { Tooltip } from '../Tooltip'

import { Toolbar } from './Toolbar'

export default {
  title: 'Components/Toolbar',
  component: Toolbar,
}

const Toggle = ({ icon, label, pressed }: { icon: IconImage; label: string; pressed?: boolean }) => (
  <Tooltip text={label}>
    <ToggleButton skin='ghost' size='small' aria-label={label} defaultPressed={pressed}>
      <Icon icon={icon} aria-hidden='true' />
    </ToggleButton>
  </Tooltip>
)

export const TextFormatting = () => (
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

export const BulkActions = () => (
  <Toolbar
    aria-label='Actions for the selected orders'
    style={{ padding: '0.5rem 1rem', background: 'rgba(0, 0, 0, 0.04)', borderRadius: 4 }}
  >
    <Text fontWeight='bold' style={{ marginRight: 'auto' }}>
      3 orders selected
    </Text>
    <Button size='small' skin='ghost'>
      <Icon icon='download' aria-hidden='true' style={{ marginRight: '0.5rem' }} />
      Export
    </Button>
    <Button size='small' skin='ghost'>
      <Icon icon='archiveOutline' aria-hidden='true' style={{ marginRight: '0.5rem' }} />
      Archive
    </Button>
    <Button size='small' skin='ghost' kind='danger'>
      <Icon icon='trashOutline' aria-hidden='true' style={{ marginRight: '0.5rem' }} />
      Delete
    </Button>
  </Toolbar>
)
