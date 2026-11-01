import { Heading, Paper, Text } from '@lemonade/ui'
import React from 'react'

function PaperDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
      {([10, 40, 80] as const).map((elevation) => (
        <Paper key={elevation} elevation={elevation} style={{ padding: '1rem', width: '10rem' }}>
          <Heading level={4}>Elevation {elevation}</Heading>
          <Text>Content of the paper.</Text>
        </Paper>
      ))}
    </div>
  )
}

export default PaperDemo
