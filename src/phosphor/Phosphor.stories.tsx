import React from 'react'

import { HFlow } from '../components/HFlow'
import { Text } from '../components/Text'
import { VFlow } from '../components/VFlow'

import { PhAirplane } from './generated/PhAirplane'
import { PhBell } from './generated/PhBell'
import { PhHeart } from './generated/PhHeart'
import { PhHouse } from './generated/PhHouse'
import { PhLightbulb } from './generated/PhLightbulb'
import { PhMagnifyingGlass } from './generated/PhMagnifyingGlass'
import { PhosphorIconProvider } from './PhosphorContext'
import { PHOSPHOR_WEIGHTS, PhosphorWeight } from './types'

const icons = [PhHouse, PhMagnifyingGlass, PhBell, PhHeart, PhAirplane, PhLightbulb]

export default {
  title: 'Phosphor/Icons',
  component: PhAirplane,
  argTypes: {
    weight: { control: 'select', options: PHOSPHOR_WEIGHTS },
    size: { control: { type: 'range', min: 16, max: 96, step: 4 } },
    color: { control: 'color' },
    mirrored: { control: 'boolean' },
  },
  args: {
    weight: 'regular',
    size: 32,
    color: 'currentColor',
    mirrored: false,
  },
}

export const Default = (args) => <PhAirplane {...args} />

export const Weights = () => (
  <VFlow vSpacing={1}>
    {PHOSPHOR_WEIGHTS.map((weight: PhosphorWeight) => (
      <HFlow key={weight} alignItems='center' hSpacing={1.5}>
        <Text style={{ width: 80 }}>{weight}</Text>
        {icons.map((Ph) => (
          <Ph key={Ph.displayName} weight={weight} size={32} />
        ))}
      </HFlow>
    ))}
  </VFlow>
)

export const WithProvider = () => (
  <PhosphorIconProvider weight='duotone' size={40} color='#5E7300' duotoneColor='#C2DC4E' duotoneOpacity={1}>
    <HFlow hSpacing={1.5}>
      {icons.map((Ph) => (
        <Ph key={Ph.displayName} />
      ))}
    </HFlow>
  </PhosphorIconProvider>
)
