import { ColorField, Flow, Tag } from '@lemonade/ui'
import React, { useState } from 'react'

const swatches = [
  { value: '#5E7300', label: 'Green' },
  { value: '#0069D0', label: 'Blue' },
  { value: '#7F28C2', label: 'Purple' },
  { value: '#D01E29', label: 'Red' },
  { value: '#E5741A', label: 'Orange' },
  { value: '#5F606F', label: 'Gray' },
]

function ColorFieldDemo() {
  const [color, setColor] = useState('#0069D0')

  return (
    <Flow direction='vertical'>
      <ColorField label='Tag color' value={color} onChange={setColor} swatches={swatches} />
      <div>
        <Tag style={{ background: color, color: '#FFFFFF' }}>Urgent</Tag>
      </div>
    </Flow>
  )
}

export default ColorFieldDemo
