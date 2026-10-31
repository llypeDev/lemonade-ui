import React, { useState } from 'react'

import { Button } from '../Button'
import { Flow } from '../Flow'
import { Heading } from '../Heading'
import { Text } from '../Text'
import { TreeView } from '../TreeView'

import { Splitter } from './Splitter'

export default {
  title: 'Components/Splitter',
  component: Splitter,
}

const frame = {
  height: '20rem',
  border: '1px solid #D3D4DD',
  borderRadius: 4,
}

const folders = [
  {
    id: 'docs',
    label: 'Documents',
    icon: 'folderOutline' as const,
    children: [
      { id: 'contracts', label: 'Contracts', icon: 'folderOutline' as const },
      { id: 'invoices', label: 'Invoices', icon: 'folderOutline' as const },
    ],
  },
  { id: 'photos', label: 'Photos', icon: 'folderOutline' as const },
  { id: 'music', label: 'Music', icon: 'folderOutline' as const },
]

const Details = () => (
  <div style={{ padding: '1rem' }}>
    <Heading level={3}>Invoices</Heading>
    <Text component='p'>
      12 files, 4.2 MB. Drag the divider, or focus it and use the arrow keys, to resize the panels.
    </Text>
  </div>
)

export const Default = () => (
  <Splitter defaultSize={35} min={20} max={70} label='Resize the folder list' style={frame}>
    <div style={{ padding: '0.5rem' }}>
      <TreeView aria-label='Folders' items={folders} defaultExpanded={['docs']} defaultSelected='invoices' />
    </div>
    <Details />
  </Splitter>
)

export const Vertical = () => (
  <Splitter direction='vertical' defaultSize={60} style={frame}>
    <div style={{ padding: '1rem' }}>
      <Heading level={3}>Query</Heading>
      <Text component='p'>SELECT name, email FROM customers WHERE plan = 'pro'</Text>
    </div>
    <div style={{ padding: '1rem' }}>
      <Heading level={3}>Results</Heading>
      <Text component='p'>3 rows</Text>
    </div>
  </Splitter>
)

export const Controlled = () => {
  const [size, setSize] = useState(30)

  return (
    <Flow direction='vertical'>
      <Flow direction='horizontal' alignItems='center'>
        <Button size='small' onClick={() => setSize(10)}>
          Collapse
        </Button>
        <Button size='small' onClick={() => setSize(30)}>
          Reset
        </Button>
        <Text>First panel: {Math.round(size)}%</Text>
      </Flow>
      <Splitter size={size} onSizeChange={setSize} style={frame}>
        <div style={{ padding: '1rem' }}>Navigation</div>
        <Details />
      </Splitter>
    </Flow>
  )
}
