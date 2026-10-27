import { keyframes } from 'emotion'
import React, { CSSProperties } from 'react'

import { HFlow } from '../components/HFlow'
import { Text } from '../components/Text'
import { VFlow } from '../components/VFlow'
import { Theme, useStyles, useTheme } from '../styles'

import { PhArrowRight } from './generated/PhArrowRight'
import { PhBell } from './generated/PhBell'
import { PhGear } from './generated/PhGear'
import { PhHeart } from './generated/PhHeart'
import { PhLightning } from './generated/PhLightning'
import { PhPlanet } from './generated/PhPlanet'
import { PhSmiley } from './generated/PhSmiley'
import { PhSun } from './generated/PhSun'

function Recipe(props: { description: string; children: React.ReactNode }) {
  const { classes } = useStyles(createStyles)

  return (
    <VFlow vSpacing={0.5}>
      <div className={classes.stage}>{props.children}</div>
      <Text color='secondary'>{props.description}</Text>
    </VFlow>
  )
}

const ring = keyframes({
  '0%, 100%': { transform: 'rotate(0deg)' },
  '15%': { transform: 'rotate(14deg)' },
  '30%': { transform: 'rotate(-12deg)' },
  '45%': { transform: 'rotate(8deg)' },
  '60%': { transform: 'rotate(-6deg)' },
  '75%': { transform: 'rotate(2deg)' },
})

const pulse = keyframes({
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.15)' },
})

const createStyles = (theme: Theme) => ({
  stage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    width: 360,
    height: 128,
    borderRadius: theme.radius.paper,
    background: theme.pallete.surface.background,
    color: theme.pallete.text.main,
  } as CSSProperties,
  spin: {
    animation: `${theme.animation.spinAround} 4s linear infinite`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  } as CSSProperties,
  ring: {
    transformOrigin: '50% 10%',
    animation: `${ring} 1.6s ease-in-out infinite`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  } as CSSProperties,
  pulse: {
    animation: `${pulse} 1.2s ease-in-out infinite`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  } as CSSProperties,
})

export default {
  title: 'Phosphor/Recipes',
}

export const Gradient = () => {
  const lemon = useTheme().pallete.primary

  return (
    <Recipe description='Pass a linearGradient as children and use it as the color.'>
      <PhHeart size={64} weight='fill' color='url(#phosphor-story-gradient)'>
        <defs>
          <linearGradient id='phosphor-story-gradient' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor={lemon.c70} />
            <stop offset='100%' stopColor={lemon.c30} />
          </linearGradient>
        </defs>
      </PhHeart>
      <PhSun size={64} weight='duotone' color='url(#phosphor-story-gradient-2)'>
        <defs>
          <linearGradient id='phosphor-story-gradient-2' x1='0' y1='1' x2='1' y2='0'>
            <stop offset='0%' stopColor='#E76F00' />
            <stop offset='100%' stopColor='#D5A400' />
          </linearGradient>
        </defs>
      </PhSun>
    </Recipe>
  )
}

export const TwoColors = () => {
  const theme = useTheme()

  return (
    <Recipe description='Duotone icons accept duotoneColor and duotoneOpacity.'>
      <PhLightning
        size={64}
        weight='duotone'
        color={theme.pallete.primary.c40}
        duotoneColor='#D5A400'
        duotoneOpacity={0.45}
      />
      <PhPlanet
        size={64}
        weight='duotone'
        color={theme.pallete.text.main}
        duotoneColor={theme.pallete.primary.c70}
        duotoneOpacity={1}
      />
    </Recipe>
  )
}

export const Animation = () => {
  const { classes } = useStyles(createStyles)

  return (
    <Recipe description='Icons are plain SVG: animate them with CSS and turn it off for prefers-reduced-motion.'>
      <PhGear size={64} className={classes.spin} />
      <PhBell size={64} weight='bold' className={classes.ring} />
      <PhHeart size={48} weight='fill' color='#E0245E' className={classes.pulse} />
    </Recipe>
  )
}

export const HandDrawn = () => (
  <Recipe description='SVG filters such as turbulence give a sketchy look.'>
    <PhSmiley size={64} weight='light' style={{ filter: 'url(#phosphor-story-rough)' }}>
      <defs>
        <filter id='phosphor-story-rough'>
          <feTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves={2} result='noise' />
          <feDisplacementMap in='SourceGraphic' in2='noise' scale={10} />
        </filter>
      </defs>
    </PhSmiley>
  </Recipe>
)

export const Mirrored = () => (
  <Recipe description='mirrored flips the icon for right-to-left layouts.'>
    <HFlow hSpacing={1.5}>
      <PhArrowRight size={56} weight='bold' />
      <PhArrowRight size={56} weight='bold' mirrored />
    </HFlow>
  </Recipe>
)
