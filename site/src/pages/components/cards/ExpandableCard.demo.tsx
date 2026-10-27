import { Button, ExpandableCard, HFlow, Text, VFlow } from '@lemonade/ui'
import React from 'react'

function ExpandableCardDemo() {
  return (
    <VFlow vSpacing={0.5}>
      <ExpandableCard title='Order #1024' defaultExpanded>
        <VFlow vSpacing={0.5}>
          <Text>3 items · delivered on October 21</Text>
          <HFlow>
            <Button size='small'>Track order</Button>
          </HFlow>
        </VFlow>
      </ExpandableCard>
      <ExpandableCard title='Order #1023'>
        <Text>1 item · delivered on October 2</Text>
      </ExpandableCard>
    </VFlow>
  )
}

export default ExpandableCardDemo
