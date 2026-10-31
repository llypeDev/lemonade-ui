import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'
import { Dropdown } from './Dropdown'
import { DropdownCheckboxItem } from './DropdownCheckboxItem'
import { DropdownDivider } from './DropdownDivider'
import { DropdownGroup } from './DropdownGroup'
import { DropdownItem } from './DropdownItem'
import { DropdownMenu } from './DropdownMenu'
import { DropdownRadioGroup, DropdownRadioItem } from './DropdownRadioGroup'
import { DropdownSubmenu } from './DropdownSubmenu'

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200px' }}>
        <Story />
      </div>
    ),
  ],
  args: { autoclose: true },
}

export const Default = (args) => {
  const [anchorRef, setAnchorRef] = useState<HTMLButtonElement>()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button innerRef={setAnchorRef} size='small' aria-label='More actions' onClick={() => setOpen((state) => !state)}>
        <Icon icon='dots' />
      </Button>

      <Dropdown anchorRef={anchorRef} open={open} onClose={() => setOpen(false)} autoclose={args.autoclose}>
        <DropdownItem onClick={action('onClick Item #1')}>Item 1</DropdownItem>
        <DropdownItem onClick={action('onClick Item #2')} component='a' href=''>
          Item 2 - Link
        </DropdownItem>
        <Tooltip text='This is disabled'>
          <DropdownItem onClick={action('onClick Item #3')} disabled>
            Item 3
          </DropdownItem>
        </Tooltip>
        <DropdownDivider />
        <DropdownItem onClick={action('onClick Item #4')} type='danger'>
          Item #4
        </DropdownItem>
      </Dropdown>
    </>
  )
}

export const Menu = () => (
  <DropdownMenu>
    <DropdownItem onClick={action('clicked item 1')}>Option</DropdownItem>
    <DropdownItem onClick={action('clicked item 2')} disabled>
      Option
    </DropdownItem>
    <DropdownItem onClick={action('clicked item 3')}>Option</DropdownItem>
    <DropdownDivider />
    <DropdownItem onClick={action('clicked item 4')} type='danger' disabled>
      Danger Option
    </DropdownItem>
    <DropdownItem onClick={action('clicked item 4')} type='danger'>
      <Tooltip text='Some danger option'>
        <div>Danger Option</div>
      </Tooltip>
    </DropdownItem>
  </DropdownMenu>
)

export const RichItems = () => (
  <DropdownMenu aria-label='File'>
    <DropdownItem icon='copyOutline' shortcut={['Ctrl', 'C']}>
      Copy
    </DropdownItem>
    <DropdownItem icon='penOutline' shortcut='F2'>
      Rename
    </DropdownItem>
    <DropdownItem icon={null}>Duplicate</DropdownItem>
    <DropdownDivider />
    <DropdownCheckboxItem checked>Show hidden files</DropdownCheckboxItem>
    <DropdownCheckboxItem checked={false}>Show file extensions</DropdownCheckboxItem>
    <DropdownDivider />
    <DropdownGroup label='Share'>
      <DropdownItem icon='userOutline'>With people</DropdownItem>
      <DropdownItem icon='link' disabled>
        With a link
      </DropdownItem>
    </DropdownGroup>
  </DropdownMenu>
)

export const CheckboxRadioAndSubmenu = () => {
  const [anchorRef, setAnchorRef] = useState<HTMLButtonElement>()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [extensions, setExtensions] = useState(true)
  const [sort, setSort] = useState('name')

  return (
    <div style={{ minHeight: '22rem' }}>
      <Button innerRef={setAnchorRef} size='small' onClick={() => setOpen((state) => !state)}>
        View
      </Button>
      <Dropdown anchorRef={anchorRef} open={open} onClose={() => setOpen(false)}>
        <DropdownCheckboxItem checked={hidden} onCheckedChange={setHidden}>
          Show hidden files
        </DropdownCheckboxItem>
        <DropdownCheckboxItem checked={extensions} onCheckedChange={setExtensions}>
          Show file extensions
        </DropdownCheckboxItem>
        <DropdownDivider />
        <DropdownRadioGroup label='Sort by' value={sort} onValueChange={setSort}>
          <DropdownRadioItem value='name'>Name</DropdownRadioItem>
          <DropdownRadioItem value='date'>Date modified</DropdownRadioItem>
          <DropdownRadioItem value='size'>Size</DropdownRadioItem>
        </DropdownRadioGroup>
        <DropdownDivider />
        <DropdownSubmenu label='Move to' icon='folderOutline'>
          <DropdownItem onClick={action('moved to Documents')}>Documents</DropdownItem>
          <DropdownItem onClick={action('moved to Photos')}>Photos</DropdownItem>
          <DropdownItem onClick={action('moved to Archive')}>Archive</DropdownItem>
        </DropdownSubmenu>
      </Dropdown>
    </div>
  )
}

CheckboxRadioAndSubmenu.parameters = {
  // The menu opens with a click
  loki: { skip: true },
}
