import React from 'react'

import { Button } from '../components/Button'
import { HFlow } from '../components/HFlow'
import { Icon } from '../components/Icon'
import { Text } from '../components/Text'
import { VFlow } from '../components/VFlow'

import { PhAirplane } from './generated/PhAirplane'
import { PhBell } from './generated/PhBell'
import { PhCheckCircle } from './generated/PhCheckCircle'
import { PhHeart } from './generated/PhHeart'
import { PhHouse } from './generated/PhHouse'
import { PhInfo } from './generated/PhInfo'
import { PhLightbulb } from './generated/PhLightbulb'
import { PhMagnifyingGlass } from './generated/PhMagnifyingGlass'
import { PhRocketLaunch } from './generated/PhRocketLaunch'
import { PhTrash } from './generated/PhTrash'
import { PhWarning } from './generated/PhWarning'
import { PhXCircle } from './generated/PhXCircle'
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

export const WithIconComponent = () => (
  <VFlow vSpacing={1}>
    <Text color='secondary'>Passed to Icon, Phosphor icons get rem sizing and the theme text colors.</Text>
    <HFlow alignItems='center' hSpacing={1.5}>
      <Icon icon={PhRocketLaunch} size={2} fill='primary' />
      <Icon icon={PhCheckCircle} size={2} fill='success' />
      <Icon icon={PhInfo} size={2} fill='info' />
      <Icon icon={PhWarning} size={2} fill='alert' />
      <Icon icon={PhXCircle} size={2} fill='danger' />
    </HFlow>
  </VFlow>
)

export const Accessibility = () => (
  <VFlow vSpacing={1.5}>
    <VFlow vSpacing={0.25}>
      <HFlow alignItems='center' hSpacing={0.5}>
        <PhBell size={24} />
        <Text>Notifications</Text>
      </HFlow>
      <Text color='secondary'>Decorative: the text already says it all, so the icon stays hidden (aria-hidden).</Text>
    </VFlow>

    <VFlow vSpacing={0.25}>
      <HFlow alignItems='center' hSpacing={0.5}>
        <PhWarning size={24} weight='fill' title='Warning' />
        <Text>Your session expires in 5 minutes</Text>
      </HFlow>
      <Text color='secondary'>Meaningful on its own: give it a name with title (or aria-label).</Text>
    </VFlow>

    <VFlow vSpacing={0.25}>
      <HFlow alignItems='center' hSpacing={0.5}>
        <Button skin='ghost' size='small' aria-label='Delete file'>
          <PhTrash size={20} />
        </Button>
      </HFlow>
      <Text color='secondary'>Icon-only button: label the button and keep the icon decorative.</Text>
    </VFlow>
  </VFlow>
)
