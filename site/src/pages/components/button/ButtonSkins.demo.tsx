import { Button, VFlow } from '@lemonade/ui'
import React from 'react'

function ButtonSkins() {
  return (
    <VFlow>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
        <Button kind='normal' skin='default'>
          Normal / Default
        </Button>
        <Button kind='normal' skin='ghost'>
          Normal / Ghost
        </Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
        <Button kind='primary' skin='default'>
          Primary / Default
        </Button>
        <Button kind='primary' skin='outline'>
          Primary / Outline
        </Button>
        <Button kind='primary' skin='ghost'>
          Primary / Ghost
        </Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem' }}>
        <Button kind='danger' skin='default'>
          Danger / Default
        </Button>
        <Button kind='danger' skin='outline'>
          Danger / Outline
        </Button>
        <Button kind='danger' skin='ghost'>
          Danger / Ghost
        </Button>
      </div>
    </VFlow>
  )
}

export default ButtonSkins
