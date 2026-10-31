import React, { useState } from 'react'

import { DropdownDivider, DropdownItem } from '../Dropdown'
import { Flow } from '../Flow'
import { Icon } from '../Icon'
import { Text } from '../Text'

import { ContextMenu } from './ContextMenu'

export default {
  title: 'Components/ContextMenu',
  component: ContextMenu,
}

const area = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '10rem',
  border: '1px dashed #9A9BA9',
  borderRadius: 4,
  color: '#5F606F',
}

export const Default = () => {
  const [last, setLast] = useState('')

  return (
    <Flow direction='vertical'>
      <ContextMenu
        label='Canvas actions'
        menu={
          <>
            <DropdownItem onClick={() => setLast('Paste')}>Paste</DropdownItem>
            <DropdownItem onClick={() => setLast('Select all')}>Select all</DropdownItem>
            <DropdownDivider />
            <DropdownItem disabled>Undo</DropdownItem>
          </>
        }
      >
        <div tabIndex={0} style={area}>
          Right click here, long press it, or focus it and press Shift + F10
        </div>
      </ContextMenu>
      <Text color='secondary'>{last ? `Last action: ${last}` : 'No action yet'}</Text>
    </Flow>
  )
}

const files = ['Contract.pdf', 'Invoice 2024-05.pdf', 'Logo.svg']

export const Files = () => {
  const [items, setItems] = useState(files)

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: '24rem' }}>
      {items.map((file) => (
        <li key={file}>
          <ContextMenu
            label={`Actions for ${file}`}
            menu={
              <>
                <DropdownItem>Open</DropdownItem>
                <DropdownItem>Download</DropdownItem>
                <DropdownDivider />
                <DropdownItem type='danger' onClick={() => setItems(items.filter((item) => item !== file))}>
                  Delete
                </DropdownItem>
              </>
            }
          >
            <div
              tabIndex={0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 4 }}
            >
              <Icon icon='fileEmptyOutline' />
              {file}
            </div>
          </ContextMenu>
        </li>
      ))}
    </ul>
  )
}
