import { Heading, HFlow, Tag, Text, ToggleCard, VFlow } from '@lemonade/ui'
import React from 'react'

function ToggleCardDemo() {
  return (
    <VFlow vSpacing={0.5}>
      <ToggleCard name='plan' value='basic' defaultChecked>
        <VFlow vSpacing={0.25}>
          <Heading level={4}>Basic plan</Heading>
          <Text>Up to 3 projects and community support.</Text>
        </VFlow>
      </ToggleCard>
      <ToggleCard name='plan' value='pro'>
        <VFlow vSpacing={0.25}>
          <HFlow hSpacing={0.5} alignItems='center'>
            <Heading level={4}>Pro plan</Heading>
            <Tag>Popular</Tag>
          </HFlow>
          <Text>Unlimited projects and priority support.</Text>
        </VFlow>
      </ToggleCard>
    </VFlow>
  )
}

export default ToggleCardDemo
