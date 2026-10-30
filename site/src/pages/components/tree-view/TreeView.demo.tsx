import { Flow, Text, TreeNode, TreeView } from '@lemonade/ui'
import React, { useState } from 'react'

const files: TreeNode[] = [
  {
    id: 'docs',
    label: 'Documents',
    icon: 'folderOutline',
    children: [
      { id: 'contract', label: 'Contract.pdf', icon: 'fileEmptyOutline' },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: 'folderOutline',
        children: [
          { id: 'sep', label: 'September.pdf', icon: 'fileEmptyOutline' },
          { id: 'oct', label: 'October.pdf', icon: 'fileEmptyOutline' },
        ],
      },
    ],
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: 'folderOutline',
    children: [{ id: 'beach', label: 'Beach.png', icon: 'fileEmptyOutline' }],
  },
  { id: 'notes', label: 'Notes.txt', icon: 'fileEmptyOutline' },
]

function TreeViewDemo() {
  const [selected, setSelected] = useState<string | null>('oct')

  return (
    <Flow direction='vertical' style={{ maxWidth: '20rem' }}>
      <TreeView
        aria-label='Files'
        items={files}
        defaultExpanded={['docs', 'invoices']}
        selected={selected}
        onSelectedChange={setSelected}
      />
      <Text role='status'>Selected: {selected}</Text>
    </Flow>
  )
}

export default TreeViewDemo
