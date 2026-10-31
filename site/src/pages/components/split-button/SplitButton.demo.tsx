import { DropdownItem, Flow, SplitButton, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function SplitButtonDemo() {
  const [last, setLast] = useState('')

  return (
    <Flow direction='vertical' style={{ minHeight: '9rem' }}>
      <div>
        <SplitButton
          kind='primary'
          onClick={() => setLast('Saved')}
          menuLabel='More ways to save'
          menu={
            <>
              <DropdownItem onClick={() => setLast('Saved as draft')}>Save as draft</DropdownItem>
              <DropdownItem onClick={() => setLast('Saved and closed')}>Save and close</DropdownItem>
            </>
          }
        >
          Save
        </SplitButton>
      </div>
      <Text color='secondary'>{last || 'Nothing saved yet'}</Text>
    </Flow>
  )
}

export default SplitButtonDemo
