import { Button, VFlow } from '@lemonade/ui'
import React from 'react'

function ButtonSizes() {
  return (
    <VFlow>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
        <Button kind='primary' size='large'>
          Large
        </Button>
        <Button kind='primary' size='medium'>
          Medium
        </Button>
        <Button kind='primary' size='small'>
          Small
        </Button>
      </div>
      <Button kind='primary' block>
        Block button
      </Button>
    </VFlow>
  )
}

export default ButtonSizes
