import { Heading, Splitter, Text, TreeView } from '@lemonade/ui'
import React, { useState } from 'react'

const folders = [
  {
    id: 'docs',
    label: 'Documents',
    children: [
      { id: 'contracts', label: 'Contracts' },
      { id: 'invoices', label: 'Invoices' },
    ],
  },
  { id: 'photos', label: 'Photos' },
  { id: 'music', label: 'Music' },
]

const names: Record<string, string> = {
  docs: 'Documents',
  contracts: 'Contracts',
  invoices: 'Invoices',
  photos: 'Photos',
  music: 'Music',
}

function SplitterDemo() {
  const [selected, setSelected] = useState('invoices')

  return (
    <Splitter
      defaultSize={35}
      min={20}
      max={70}
      label='Resize the folder list'
      style={{ height: '16rem', border: '1px solid #D3D4DD', borderRadius: 4 }}
    >
      <div style={{ padding: '0.5rem' }}>
        <TreeView
          aria-label='Folders'
          items={folders}
          defaultExpanded={['docs']}
          selected={selected}
          onSelectedChange={setSelected}
        />
      </div>
      <div style={{ padding: '1rem' }}>
        <Heading level={3}>{names[selected]}</Heading>
        <Text component='p'>Drag the divider, or focus it and use the arrow keys, to resize the panels.</Text>
      </div>
    </Splitter>
  )
}

export default SplitterDemo
