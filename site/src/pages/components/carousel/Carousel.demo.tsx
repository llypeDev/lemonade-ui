import { Button, Carousel, Heading, Text } from '@lemonade/ui'
import React from 'react'

const slides = [
  { title: 'New oak chairs', text: 'Solid wood, made to last for decades.', from: '#5E7300', to: '#B8CC33' },
  { title: 'Free shipping', text: 'On orders over R$ 300 to the whole country.', from: '#2A5D9F', to: '#76A9E8' },
  { title: 'Spring sale', text: 'Up to 30% off on lamps and rugs.', from: '#8C3B12', to: '#E39A5C' },
]

function CarouselDemo() {
  return (
    <div style={{ maxWidth: '36rem' }}>
      <Carousel label='Offers' autoPlay interval={6000}>
        {slides.map((slide) => (
          <div
            key={slide.title}
            style={{
              height: '13rem',
              padding: '2rem 4rem',
              boxSizing: 'border-box',
              color: '#FFFFFF',
              background: `linear-gradient(135deg, ${slide.from}, ${slide.to})`,
            }}
          >
            <Heading level={3} style={{ color: '#FFFFFF' }}>
              {slide.title}
            </Heading>
            <Text component='p' style={{ color: '#FFFFFF' }}>
              {slide.text}
            </Text>
            <Button size='small'>See offers</Button>
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default CarouselDemo
