import { Flow, Rating, Text } from '@lemonade/ui'
import React from 'react'

function RatingReadOnlyDemo() {
  return (
    <Flow direction='vertical'>
      <Flow direction='horizontal' alignItems='center'>
        <Rating value={4.5} readOnly />
        <Text>4.5 (1,204 reviews)</Text>
      </Flow>
      <Flow direction='horizontal' alignItems='center'>
        <Rating value={3.2} readOnly size='small' />
        <Text>3.2</Text>
      </Flow>
    </Flow>
  )
}

export default RatingReadOnlyDemo
