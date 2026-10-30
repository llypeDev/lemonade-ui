import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { TreeNode, TreeView } from './TreeView'

export default {
  title: 'Components/TreeView',
  component: TreeView,
}

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
  { id: 'notes', label: 'Notes.txt', icon: 'fileEmptyOutline', disabled: true },
]

export const Files = () => (
  <div style={{ maxWidth: '20rem' }}>
    <TreeView aria-label='Files' items={files} defaultExpanded={['docs', 'invoices']} defaultSelected='oct' />
  </div>
)

const categories: TreeNode[] = [
  {
    id: 'home',
    label: 'Home and kitchen',
    children: [
      { id: 'cookware', label: 'Cookware' },
      { id: 'decor', label: 'Decor' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    children: [
      { id: 'running', label: 'Running' },
      { id: 'cycling', label: 'Cycling' },
    ],
  },
  { id: 'books', label: 'Books' },
]

export const Controlled = () => {
  const [expanded, setExpanded] = useState<string[]>(['sports'])
  const [selected, setSelected] = useState<string | null>('running')

  return (
    <Flow direction='vertical' style={{ maxWidth: '20rem' }}>
      <TreeView
        aria-label='Categories'
        items={categories}
        expanded={expanded}
        onExpandedChange={setExpanded}
        selected={selected}
        onSelectedChange={setSelected}
      />
      <Text>Selected: {selected ?? 'none'}</Text>
    </Flow>
  )
}

Controlled.parameters = {
  loki: { skip: true },
}
