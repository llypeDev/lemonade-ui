import React from 'react'

import { Heading } from '../Heading'
import { Text } from '../Text'

import { BackToTop } from './BackToTop'

export default {
  title: 'Components/BackToTop',
  component: BackToTop,
}

const paragraph =
  'Orders move through four statuses: placed, paid, shipped and delivered. Each change is recorded in the history ' +
  'of the order, with the person who made it and the time. Customers get an email at each step.'

export const Default = () => (
  <div style={{ maxWidth: '36rem' }}>
    <Heading level={1}>Orders guide</Heading>
    <Text component='p'>Scroll down the page to see the button at the bottom right corner.</Text>
    {Array.from({ length: 30 }, (_, index) => (
      <Text key={index} component='p'>
        {paragraph}
      </Text>
    ))}
    <BackToTop threshold={200} />
  </div>
)

Default.parameters = {
  // The button shows after the page scrolls
  loki: { skip: true },
}
