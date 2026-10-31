import {
  Button,
  Dropdown,
  DropdownCheckboxItem,
  DropdownDivider,
  DropdownItem,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSubmenu,
} from '@lemonade/ui'
import React, { useState } from 'react'

function DropdownItemsDemo() {
  const [anchor, setAnchor] = useState<HTMLButtonElement>()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [sort, setSort] = useState('name')

  return (
    <div style={{ minHeight: '24rem' }}>
      <Button innerRef={setAnchor} size='small' onClick={() => setOpen(!open)}>
        File actions
      </Button>
      <Dropdown anchorRef={anchor} open={open} onClose={() => setOpen(false)}>
        <DropdownItem icon='copyOutline' shortcut={['Ctrl', 'C']}>
          Copy
        </DropdownItem>
        <DropdownItem icon='penOutline' shortcut='F2'>
          Rename
        </DropdownItem>
        <DropdownSubmenu label='Move to' icon='folderOutline'>
          <DropdownItem>Documents</DropdownItem>
          <DropdownItem>Photos</DropdownItem>
          <DropdownItem>Archive</DropdownItem>
        </DropdownSubmenu>
        <DropdownDivider />
        <DropdownCheckboxItem checked={hidden} onCheckedChange={setHidden}>
          Show hidden files
        </DropdownCheckboxItem>
        <DropdownRadioGroup label='Sort by' value={sort} onValueChange={setSort}>
          <DropdownRadioItem value='name'>Name</DropdownRadioItem>
          <DropdownRadioItem value='date'>Date modified</DropdownRadioItem>
        </DropdownRadioGroup>
      </Dropdown>
    </div>
  )
}

export default DropdownItemsDemo
