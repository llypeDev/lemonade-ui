import { keyframes } from '@emotion/core'
import { Theme, useStyles } from '@lemonade/ui'
import { PhArrowRight } from '@lemonade/ui/phosphor/generated/PhArrowRight'
import { PhBell } from '@lemonade/ui/phosphor/generated/PhBell'
import { PhGear } from '@lemonade/ui/phosphor/generated/PhGear'
import { PhHeart } from '@lemonade/ui/phosphor/generated/PhHeart'
import { PhLightning } from '@lemonade/ui/phosphor/generated/PhLightning'
import { PhPlanet } from '@lemonade/ui/phosphor/generated/PhPlanet'
import { PhSmiley } from '@lemonade/ui/phosphor/generated/PhSmiley'
import { PhSun } from '@lemonade/ui/phosphor/generated/PhSun'
import { useIntl } from 'gatsby-plugin-intl'
import React, { CSSProperties } from 'react'

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

/** Small, self-contained examples of what can be done with the Phosphor components. */
export function PhosphorRecipes() {
  const { classes, theme } = useStyles(createStyles)
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })
  const lemon = theme.pallete.primary

  return (
    <ul className={classes.list}>
      <li className={classes.card}>
        <div className={classes.stage}>
          <PhHeart size={64} weight='fill' color='url(#lemonade-recipe-gradient)'>
            <defs>
              <linearGradient id='lemonade-recipe-gradient' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='0%' stopColor={lemon.c70} />
                <stop offset='100%' stopColor={lemon.c30} />
              </linearGradient>
            </defs>
          </PhHeart>
          <PhSun size={64} weight='duotone' color='url(#lemonade-recipe-gradient-2)'>
            <defs>
              <linearGradient id='lemonade-recipe-gradient-2' x1='0' y1='1' x2='1' y2='0'>
                <stop offset='0%' stopColor='#E76F00' />
                <stop offset='100%' stopColor='#D5A400' />
              </linearGradient>
            </defs>
          </PhSun>
        </div>
        <strong>{t('phosphor-recipe-gradient')}</strong>
        <span className={classes.caption}>{t('phosphor-recipe-gradient-description')}</span>
      </li>

      <li className={classes.card}>
        <div className={classes.stage}>
          <PhLightning size={64} weight='duotone' color={lemon.c40} duotoneColor='#D5A400' duotoneOpacity={0.45} />
          <PhPlanet
            size={64}
            weight='duotone'
            color={theme.pallete.text.main}
            duotoneColor={lemon.c70}
            duotoneOpacity={1}
          />
        </div>
        <strong>{t('phosphor-recipe-duotone')}</strong>
        <span className={classes.caption}>{t('phosphor-recipe-duotone-description')}</span>
      </li>

      <li className={classes.card}>
        <div className={classes.stage}>
          <PhGear size={64} className={classes.spin} />
          <PhBell size={64} weight='bold' className={classes.ring} />
          <PhHeart size={48} weight='fill' color='#E0245E' className={classes.pulse} />
        </div>
        <strong>{t('phosphor-recipe-animation')}</strong>
        <span className={classes.caption}>{t('phosphor-recipe-animation-description')}</span>
      </li>

      <li className={classes.card}>
        <div className={classes.stage}>
          <PhSmiley size={64} weight='light' style={{ filter: 'url(#lemonade-recipe-rough)' }}>
            <defs>
              <filter id='lemonade-recipe-rough'>
                <feTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves={2} result='noise' />
                <feDisplacementMap in='SourceGraphic' in2='noise' scale={10} />
              </filter>
            </defs>
          </PhSmiley>
        </div>
        <strong>{t('phosphor-recipe-hand-drawn')}</strong>
        <span className={classes.caption}>{t('phosphor-recipe-hand-drawn-description')}</span>
      </li>

      <li className={classes.card}>
        <div className={classes.stage}>
          <PhArrowRight size={56} weight='bold' />
          <PhArrowRight size={56} weight='bold' mirrored />
        </div>
        <strong>{t('phosphor-recipe-mirrored')}</strong>
        <span className={classes.caption}>{t('phosphor-recipe-mirrored-description')}</span>
      </li>
    </ul>
  )
}

const createStyles = (theme: Theme) => ({
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
    listStyle: 'none',
    margin: '0 0 2rem 0',
    padding: 0,
  } as CSSProperties,
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    margin: 0,
    padding: '1rem',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    color: theme.pallete.text.main,
  } as CSSProperties,
  stage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    height: 112,
    marginBottom: '0.5rem',
    borderRadius: theme.radius.paper,
    background: theme.pallete.surface.background,
  } as CSSProperties,
  caption: {
    fontSize: '0.8125rem',
    color: theme.pallete.text.secondary,
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
