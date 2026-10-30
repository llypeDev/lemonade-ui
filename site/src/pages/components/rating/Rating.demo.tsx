import { Flow, Rating, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function RatingDemo() {
  const [value, setValue] = useState(0)

  return (
    <Flow direction='vertical'>
      <Text id='rating-demo-question' fontWeight='bold'>
        How was your delivery?
      </Text>
      <Rating aria-labelledby='rating-demo-question' value={value} onChange={setValue} allowClear />
      <Text role='status'>{value ? `You gave ${value} of 5 stars.` : 'Not rated yet.'}</Text>
    </Flow>
  )
}

export default RatingDemo
