import { HFlow, Tag, Text, ToggleCard, VFlow } from '@lemonade/ui'
import React from 'react'

function ToggleCardDemo() {
  return (
    <VFlow vSpacing={0.5}>
      <ToggleCard name='plan' value='basic' defaultChecked>
        <VFlow vSpacing={0.25}>
          <Text variant='h4'>Basic plan</Text>
          <Text>Up to 3 projects and community support.</Text>
        </VFlow>
      </ToggleCard>
      <ToggleCard name='plan' value='pro'>
        <VFlow vSpacing={0.25}>
          <HFlow hSpacing={0.5} alignItems='center'>
            <Text variant='h4'>Pro plan</Text>
            <Tag>Popular</Tag>
          </HFlow>
          <Text>Unlimited projects and priority support.</Text>
        </VFlow>
      </ToggleCard>
    </VFlow>
  )
}

export default ToggleCardDemo
