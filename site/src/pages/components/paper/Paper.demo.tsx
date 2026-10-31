import { Flow, Heading, Paper, Text } from '@lemonade/ui'
import React from 'react'

function PaperDemo() {
  return (
    <Flow direction='horizontal' gap={1.5}>
      {([10, 40, 80] as const).map((elevation) => (
        <Paper key={elevation} elevation={elevation} style={{ padding: '1rem', width: '10rem' }}>
          <Heading level={4}>Elevation {elevation}</Heading>
          <Text>Content of the paper.</Text>
        </Paper>
      ))}
    </Flow>
  )
}

export default PaperDemo
