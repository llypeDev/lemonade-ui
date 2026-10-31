import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Tag } from '../Tag'

import { ColorField } from './ColorField'

export default {
  title: 'Components/ColorField',
  component: ColorField,
}

const swatches = [
  { value: '#5E7300', label: 'Green' },
  { value: '#0069D0', label: 'Blue' },
  { value: '#7F28C2', label: 'Purple' },
  { value: '#D01E29', label: 'Red' },
  { value: '#E5741A', label: 'Orange' },
  { value: '#F2C94C', label: 'Yellow' },
  { value: '#5F606F', label: 'Gray' },
]

export const Default = () => {
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

export const States = () => (
  <Flow direction='vertical'>
    <ColorField label='Swatches only' defaultValue='#5E7300' swatches={swatches} allowCustom={false} />
    <ColorField label='Default swatches' />
    <ColorField label='With an error' defaultValue='#F2C94C' error='This color is already used by another tag' />
    <ColorField label='Disabled' defaultValue='#7F28C2' swatches={swatches} disabled />
  </Flow>
)
