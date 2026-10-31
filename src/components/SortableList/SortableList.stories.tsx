import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Tag } from '../Tag'
import { Text } from '../Text'

import { SortableList } from './SortableList'

export default {
  title: 'Components/SortableList',
  component: SortableList,
}

export const Default = () => {
  const [steps, setSteps] = useState(['Collect the requirements', 'Draw the screens', 'Build', 'Test', 'Release'])

  return <SortableList aria-label='Project steps' items={steps} onChange={setSteps} style={{ maxWidth: '24rem' }} />
}

interface Column {
  id: string
  label: string
  description: string
  visible: boolean
}

export const CustomContent = () => {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', label: 'Name', description: 'Full name of the customer', visible: true },
    { id: 'email', label: 'Email', description: 'Address used to sign in', visible: true },
    { id: 'plan', label: 'Plan', description: 'Basic, Pro or Enterprise', visible: false },
    { id: 'created', label: 'Created', description: 'Date of the first order', visible: true },
  ])

  return (
    <Flow direction='vertical' style={{ maxWidth: '28rem' }}>
      <Text component='p'>
        Drag the columns, or focus a handle and use Space and the arrow keys, to change the order.
      </Text>
      <SortableList
        aria-label='Table columns'
        items={columns}
        onChange={setColumns}
        renderItem={(column) => (
          <Flow direction='horizontal' alignItems='center' justifyContent='space-between'>
            <div>
              <Text fontWeight='bold' component='div'>
                {column.label}
              </Text>
              <Text color='secondary' component='div'>
                {column.description}
              </Text>
            </div>
            {!column.visible && <Tag type='normal'>Hidden</Tag>}
          </Flow>
        )}
      />
      <Text color='secondary'>Order: {columns.map((column) => column.label).join(', ')}</Text>
    </Flow>
  )
}
