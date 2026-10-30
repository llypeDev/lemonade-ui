import React, { useState } from 'react'

import { Flow } from '../Flow'
import { Text } from '../Text'

import { Rating } from './Rating'

export default {
  title: 'Components/Rating',
  component: Rating,
}

export const Default = () => (
  <Flow direction='vertical'>
    <Rating aria-label='Your rating' defaultValue={3} />
    <Rating aria-label='Small rating' defaultValue={4} size='small' />
    <Rating aria-label='Large rating' defaultValue={2} size='large' />
    <Rating aria-label='Disabled rating' defaultValue={3} disabled />
  </Flow>
)

export const ReadOnly = () => (
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

export const Interactive = () => {
  const [value, setValue] = useState(0)

  return (
    <Flow direction='vertical'>
      <Text id='rating-question' fontWeight='bold'>
        How was your delivery?
      </Text>
      <Rating aria-labelledby='rating-question' value={value} onChange={setValue} allowClear />
      <Text>{value ? `You gave ${value} of 5 stars.` : 'Not rated yet.'}</Text>
    </Flow>
  )
}

Interactive.parameters = {
  loki: { skip: true },
}
