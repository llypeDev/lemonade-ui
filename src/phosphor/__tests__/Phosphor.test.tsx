import { render } from '@testing-library/react'
import React from 'react'

import { Icon } from '../../components/Icon'
import { createPhosphorIcon } from '../createPhosphorIcon'
import { PhAirplane } from '../generated/PhAirplane'
import { PhHeart } from '../generated/PhHeart'
import { PHOSPHOR_ICON_COUNT, PHOSPHOR_VERSION } from '../generated/names'
import { PhosphorIconProvider } from '../PhosphorContext'
import { PHOSPHOR_WEIGHTS, PhosphorIconData } from '../types'

const data: PhosphorIconData = {
  thin: ['M0 0Z'],
  light: ['M1 1Z'],
  regular: ['M2 2Z'],
  bold: ['M3 3Z'],
  fill: ['M4 4Z'],
  duotone: [['M5 5Z', 0.2], 'M6 6Z'],
}

const TestIcon = createPhosphorIcon('TestIcon', data)

const paths = (container: HTMLElement) => Array.from(container.querySelectorAll('path')).map((p) => p.getAttribute('d'))

describe('createPhosphorIcon', () => {
  it('renders the regular weight with Phosphor defaults', () => {
    const { container } = render(<TestIcon />)
    const svg = container.querySelector('svg')!

    expect(svg.getAttribute('viewBox')).toBe('0 0 256 256')
    expect(svg.getAttribute('width')).toBe('1em')
    expect(svg.getAttribute('height')).toBe('1em')
    expect(svg.getAttribute('fill')).toBe('currentColor')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('role')).toBeNull()
    expect(paths(container)).toEqual(['M2 2Z'])
  })

  it.each(PHOSPHOR_WEIGHTS.filter((weight) => weight !== 'duotone'))('renders the %s weight', (weight) => {
    const { container } = render(<TestIcon weight={weight} />)
    expect(paths(container)).toEqual(data[weight])
  })

  it('renders the duotone background layer with opacity', () => {
    const { container } = render(<TestIcon weight='duotone' />)
    const [background, foreground] = Array.from(container.querySelectorAll('path'))

    expect(background.getAttribute('d')).toBe('M5 5Z')
    expect(background.getAttribute('opacity')).toBe('0.2')
    expect(background.getAttribute('fill')).toBeNull()
    expect(foreground.getAttribute('d')).toBe('M6 6Z')
    expect(foreground.getAttribute('opacity')).toBeNull()
  })

  it('accepts duotone color and opacity overrides', () => {
    const { container } = render(<TestIcon weight='duotone' duotoneColor='#C2DC4E' duotoneOpacity={0.5} />)
    const background = container.querySelector('path')!

    expect(background.getAttribute('fill')).toBe('#C2DC4E')
    expect(background.getAttribute('opacity')).toBe('0.5')
  })

  it('accepts size and color', () => {
    const { container } = render(<TestIcon size={32} color='#5E7300' />)
    const svg = container.querySelector('svg')!

    expect(svg.getAttribute('width')).toBe('32')
    expect(svg.getAttribute('height')).toBe('32')
    expect(svg.getAttribute('fill')).toBe('#5E7300')
  })

  it('exposes an accessible name when title is set', () => {
    const { container, getByTitle } = render(<TestIcon title='Airplane' />)
    const svg = container.querySelector('svg')!

    expect(getByTitle('Airplane')).toBeTruthy()
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-hidden')).toBeNull()
  })

  it('exposes an accessible name when aria-label is set', () => {
    const { container } = render(<TestIcon aria-label='Airplane' />)
    const svg = container.querySelector('svg')!

    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('Airplane')
  })

  it('mirrors the icon and keeps custom styles', () => {
    const { container } = render(<TestIcon mirrored style={{ opacity: 0.5 }} />)
    const svg = container.querySelector('svg')!

    expect(svg.style.transform).toBe('scale(-1, 1)')
    expect(svg.style.opacity).toBe('0.5')
  })

  it('renders children (e.g. gradients) before the icon paths', () => {
    const { container } = render(
      <TestIcon color='url(#grad)'>
        <defs>
          <linearGradient id='grad' />
        </defs>
      </TestIcon>
    )
    const svg = container.querySelector('svg')!

    expect(svg.firstElementChild!.tagName).toBe('defs')
    expect(svg.getAttribute('fill')).toBe('url(#grad)')
  })

  it('lets explicit SVG props override the defaults', () => {
    const { container } = render(<TestIcon width='2rem' height='2rem' className='custom' />)
    const svg = container.querySelector('svg')!

    expect(svg.getAttribute('width')).toBe('2rem')
    expect(svg.getAttribute('class')).toBe('custom')
  })

  it('forwards refs to the svg element', () => {
    const ref = React.createRef<SVGSVGElement>()
    render(<TestIcon ref={ref} />)

    expect(ref.current).toBeInstanceOf(SVGSVGElement)
  })

  it('has a display name', () => {
    expect(TestIcon.displayName).toBe('TestIcon')
  })
})

describe('PhosphorIconProvider', () => {
  it('provides default props', () => {
    const { container } = render(
      <PhosphorIconProvider weight='bold' size={48} color='#5E7300' mirrored>
        <TestIcon />
      </PhosphorIconProvider>
    )
    const svg = container.querySelector('svg')!

    expect(paths(container)).toEqual(['M3 3Z'])
    expect(svg.getAttribute('width')).toBe('48')
    expect(svg.getAttribute('fill')).toBe('#5E7300')
    expect(svg.style.transform).toBe('scale(-1, 1)')
  })

  it('merges nested providers and lets props win', () => {
    const { container } = render(
      <PhosphorIconProvider weight='bold' size={48}>
        <PhosphorIconProvider weight='fill'>
          <TestIcon />
          <TestIcon weight='thin' size={16} />
        </PhosphorIconProvider>
      </PhosphorIconProvider>
    )
    const [first, second] = Array.from(container.querySelectorAll('svg'))

    expect(first.querySelector('path')!.getAttribute('d')).toBe('M4 4Z')
    expect(first.getAttribute('width')).toBe('48')
    expect(second.querySelector('path')!.getAttribute('d')).toBe('M0 0Z')
    expect(second.getAttribute('width')).toBe('16')
  })
})

describe('generated Phosphor icons', () => {
  it('renders every weight of a generated icon', () => {
    PHOSPHOR_WEIGHTS.forEach((weight) => {
      const { container, unmount } = render(<PhAirplane weight={weight} />)
      expect(container.querySelectorAll('path').length).toBeGreaterThan(0)
      unmount()
    })
  })

  it('renders the duotone background layer of a generated icon', () => {
    const { container } = render(<PhHeart weight='duotone' />)
    expect(container.querySelector('path[opacity]')).toBeTruthy()
  })

  it('works inside the Lemonade Icon component', () => {
    const { container } = render(<Icon icon={PhHeart} fill='primary' size={2} />)
    const svg = container.querySelector('svg')!

    expect(svg.getAttribute('width')).toBe('1em')
    expect(svg.getAttribute('viewBox')).toBe('0 0 256 256')
    expect(svg.getAttribute('class')).toBeTruthy()
  })

  it('exposes the vendored catalog metadata', () => {
    // The 1:1 match between vendor/phosphor/catalog.json and the generated files is enforced by
    // `yarn phosphor:check` in CI; here we only assert the generated metadata is sane.
    expect(PHOSPHOR_ICON_COUNT).toBeGreaterThan(1000)
    expect(PHOSPHOR_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
