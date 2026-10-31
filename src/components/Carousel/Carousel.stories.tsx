import React from 'react'

import { Button } from '../Button'
import { Heading } from '../Heading'
import { Text } from '../Text'

import { Carousel } from './Carousel'

export default {
  title: 'Components/Carousel',
  component: Carousel,
}

const slides = [
  { title: 'New oak chairs', text: 'Solid wood, made to last for decades.', from: '#5E7300', to: '#B8CC33' },
  { title: 'Free shipping', text: 'On orders over R$ 300 to the whole country.', from: '#2A5D9F', to: '#76A9E8' },
  { title: 'Spring sale', text: 'Up to 30% off on lamps and rugs.', from: '#8C3B12', to: '#E39A5C' },
]

const renderSlides = () =>
  slides.map((slide) => (
    <div
      key={slide.title}
      style={{
        height: '14rem',
        padding: '2rem 4rem',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        background: `linear-gradient(135deg, ${slide.from}, ${slide.to})`,
      }}
    >
      <Heading level={2} style={{ color: '#FFFFFF' }}>
        {slide.title}
      </Heading>
      <Text component='p' style={{ color: '#FFFFFF' }}>
        {slide.text}
      </Text>
      <Button size='small'>See offers</Button>
    </div>
  ))

export const Default = () => (
  <div style={{ maxWidth: '40rem' }}>
    <Carousel label='Offers'>{renderSlides()}</Carousel>
  </div>
)

export const AutoPlay = () => (
  <div style={{ maxWidth: '40rem' }}>
    <Carousel label='Offers' autoPlay interval={4000}>
      {renderSlides()}
    </Carousel>
  </div>
)

AutoPlay.parameters = {
  // The slides change with the clock
  loki: { skip: true },
}

export const WithoutLoop = () => (
  <div style={{ maxWidth: '40rem' }}>
    <Carousel label='Getting started' loop={false} defaultIndex={1}>
      {renderSlides()}
    </Carousel>
  </div>
)
