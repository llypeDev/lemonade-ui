import React from 'react'

import { Card } from '../Card'
import { Flow } from '../Flow'
import { Heading } from '../Heading'
import { Rating } from '../Rating'

import { ExpandableText } from './ExpandableText'

export default {
  title: 'Components/ExpandableText',
  component: ExpandableText,
}

const review =
  'The blender arrived two days early and was very well packed. It is quiet for its power and crushes ice in a few seconds. ' +
  'The jar is easy to clean, although the lid is a bit hard to close at first. After a month of daily use, it still works like on the ' +
  'first day. I would only like a longer cord, since mine barely reaches the outlet next to the counter.'

export const Default = () => (
  <Card style={{ maxWidth: '28rem' }}>
    <Flow direction='vertical' gap={0.5}>
      <Heading level={4} fontWeight='bold'>
        Ana Souza
      </Heading>
      <Rating value={4} readOnly size='small' />
      <ExpandableText lines={3}>{review}</ExpandableText>
    </Flow>
  </Card>
)

export const ShortText = () => (
  <div style={{ maxWidth: '28rem' }}>
    <ExpandableText lines={3}>A short text that fits shows no button.</ExpandableText>
  </div>
)

export const Expanded = () => (
  <div style={{ maxWidth: '28rem' }}>
    <ExpandableText lines={2} defaultExpanded>
      {review}
    </ExpandableText>
  </div>
)
