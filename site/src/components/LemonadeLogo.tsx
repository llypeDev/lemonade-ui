import { useTheme } from '@lemonade/ui'
import React from 'react'

export const LemonadeLogo = (props: React.SVGAttributes<SVGSVGElement>) => {
  const theme = useTheme()

  return (
    <svg viewBox='0 0 220 60' {...props}>
      <title>Lemonade</title>
      <circle cx='23.5' cy='30' r='17' fill={theme.pallete.primary.main} />
      <g stroke={theme.pallete.surface.main} strokeWidth='3.23' strokeLinecap='round'>
        <path d='M27.58 30L36.93 30' />
        <path d='M26.38 32.88L33 39.5' />
        <path d='M23.5 34.08L23.5 43.43' />
        <path d='M20.62 32.88L14 39.5' />
        <path d='M19.42 30L10.07 30' />
        <path d='M20.62 27.12L14 20.5' />
        <path d='M23.5 25.92L23.5 16.57' />
        <path d='M26.38 27.12L33 20.5' />
      </g>
      <circle cx='23.5' cy='30' r='2.89' fill={theme.pallete.primary.c70} />
      <g fill='none' stroke={theme.pallete.gray.c10} strokeWidth='4.4' strokeLinecap='round'>
        <circle cx='121' cy='35.5' r='6.3' />
        <circle cx='163' cy='35.5' r='6.3' />
        <circle cx='184' cy='35.5' r='6.3' />
        <path d='M51.7 22.7L51.7 41.8' />
        <path d='M60.1 35.5L72.7 35.5A6.3 6.3 0 1 0 70.45 40.33' />
        <path d='M81.1 41.8L81.1 35.5A6.3 6.3 0 0 1 93.7 35.5A6.3 6.3 0 0 1 106.3 35.5L106.3 41.8' />
        <path d='M135.7 41.8L135.7 35.5A6.3 6.3 0 0 1 148.3 35.5L148.3 41.8' />
        <path d='M169.3 29.2L169.3 41.8' />
        <path d='M190.3 22.7L190.3 41.8' />
        <path d='M198.7 35.5L211.3 35.5A6.3 6.3 0 1 0 209.05 40.33' />
      </g>
      <rect x='49.5' y='48.2' width='164' height='3.8' rx='1.9' fill={theme.pallete.primary.main} />
    </svg>
  )
}
