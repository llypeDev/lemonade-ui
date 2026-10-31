import { action } from '@storybook/addon-actions'
import React from 'react'

import { DropdownItem } from '../Dropdown'
import { Flow } from '../Flow'

import { SplitButton } from './SplitButton'

export default {
  title: 'Components/SplitButton',
  component: SplitButton,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '10rem' }}>
        <Story />
      </div>
    ),
  ],
}

const saveMenu = (
  <>
    <DropdownItem icon='penOutline' onClick={action('save as draft')}>
      Save as draft
    </DropdownItem>
    <DropdownItem icon='checkDefault' onClick={action('save and close')}>
      Save and close
    </DropdownItem>
  </>
)

export const Default = () => (
  <SplitButton kind='primary' onClick={action('save')} menu={saveMenu} menuLabel='More ways to save'>
    Save
  </SplitButton>
)

export const Kinds = () => (
  <Flow direction='horizontal' alignItems='center'>
    <SplitButton menu={saveMenu}>Save</SplitButton>
    <SplitButton kind='primary' menu={saveMenu}>
      Save
    </SplitButton>
    <SplitButton kind='danger' menu={<DropdownItem>Delete for everyone</DropdownItem>}>
      Delete
    </SplitButton>
    <SplitButton skin='outline' menu={saveMenu}>
      Save
    </SplitButton>
  </Flow>
)

export const Sizes = () => (
  <Flow direction='horizontal' alignItems='center'>
    <SplitButton size='small' kind='primary' menu={saveMenu}>
      Save
    </SplitButton>
    <SplitButton size='medium' kind='primary' menu={saveMenu}>
      Save
    </SplitButton>
    <SplitButton size='large' kind='primary' menu={saveMenu}>
      Save
    </SplitButton>
    <SplitButton kind='primary' menu={saveMenu} disabled>
      Save
    </SplitButton>
  </Flow>
)
