import { action } from '@storybook/addon-actions'
import React, { useEffect, useState } from 'react'

import { SortableLabel, SortDirection } from './SortableLabel'

const dirOptions: SortDirection[] = ['', 'ASC', 'DESC']

export default {
  title: 'Components/Table',
  component: SortableLabel,
  argTypes: {
    direction: {
      options: dirOptions,
      control: { type: 'select' },
    },
  },
  args: {
    direction: '',
    onClick: action('clicked'),
    onChange: action('onChange'),
  },
}

export const _SortableLabel = (args) => {
  // The story keeps the direction, as the table around a label does. The control of the direction still sets it.
  const [direction, setDirection] = useState<SortDirection>(args.direction)
  useEffect(() => setDirection(args.direction), [args.direction])

  const handleChange = (newDirection: SortDirection, shiftKey?: boolean) => {
    setDirection(newDirection)
    args.onChange(newDirection, shiftKey)
  }

  return (
    <SortableLabel {...args} direction={direction} onChange={handleChange}>
      Property
    </SortableLabel>
  )
}
