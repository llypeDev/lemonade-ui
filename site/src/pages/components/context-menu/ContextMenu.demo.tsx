import { ContextMenu, DropdownDivider, DropdownItem, Flow, Icon, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function ContextMenuDemo() {
  const [files, setFiles] = useState(['Contract.pdf', 'Invoice 2024-05.pdf', 'Logo.svg'])
  const [last, setLast] = useState('')

  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <Text color='secondary'>Right click a file, long press it, or focus it and press Shift + F10.</Text>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {files.map((file) => (
          <li key={file}>
            <ContextMenu
              label={`Actions for ${file}`}
              menu={
                <>
                  <DropdownItem onClick={() => setLast(`Opened ${file}`)}>Open</DropdownItem>
                  <DropdownItem onClick={() => setLast(`Downloaded ${file}`)}>Download</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem type='danger' onClick={() => setFiles(files.filter((item) => item !== file))}>
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
      {last && <Text>{last}</Text>}
    </Flow>
  )
}

export default ContextMenuDemo
