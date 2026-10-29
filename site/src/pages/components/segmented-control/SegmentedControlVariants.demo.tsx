import { Flow, SegmentedControl } from '@lemonade/ui'
import React from 'react'

function SegmentedControlVariantsDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <SegmentedControl
        aria-label='View'
        size='small'
        options={[
          { value: 'list', label: 'List', icon: 'list' },
          { value: 'calendar', label: 'Calendar', icon: 'calendarOutline' },
        ]}
      />
      <SegmentedControl
        aria-label='Plan'
        block
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
    </Flow>
  )
}

export default SegmentedControlVariantsDemo
