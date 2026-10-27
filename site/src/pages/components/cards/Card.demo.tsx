import { Button, Card, ClickableCard, Heading, HFlow, Text, VFlow } from '@lemonade/ui'
import React from 'react'

function CardDemo() {
  return (
    <VFlow vSpacing={0.5}>
      <Card>
        <VFlow vSpacing={0.5}>
          <VFlow vSpacing={0.25}>
            <Heading level={4}>Read-only card</Heading>
            <Text>Communicates something and can hold a call to action.</Text>
          </VFlow>
          <HFlow>
            <Button size='small'>Call to action</Button>
          </HFlow>
        </VFlow>
      </Card>
      <ClickableCard onClick={() => alert('Card clicked')}>
        <VFlow vSpacing={0.25}>
          <Heading level={4}>Clickable card</Heading>
          <Text>The whole card is the click area.</Text>
        </VFlow>
      </ClickableCard>
    </VFlow>
  )
}

export default CardDemo
