import { SegmentedControl } from '@lemonade/ui'
import React from 'react'

function ContentSwitchDemo() {
  return (
    <SegmentedControl
      aria-label='Content'
      size='small'
      options={[
        { value: 'first', label: 'First content' },
        { value: 'second', label: 'Second content' },
        { value: 'third', label: 'Third content disabled', disabled: true },
      ]}
    />
  )
}

export default ContentSwitchDemo
