import React, { forwardRef, useContext } from 'react'

import { PhosphorContext } from './PhosphorContext'
import { PhosphorIconData, PhosphorIconProps, PhosphorShape } from './types'

export type PhosphorIcon = React.ForwardRefExoticComponent<PhosphorIconProps & React.RefAttributes<SVGSVGElement>>

const DEFAULT_DUOTONE_OPACITY = 0.2

function renderShape(shape: PhosphorShape, index: number, duotoneColor?: string, duotoneOpacity?: number) {
  if (typeof shape === 'string') {
    return <path key={index} d={shape} />
  }

  const [d, opacity] = shape
  return <path key={index} d={d} opacity={duotoneOpacity ?? opacity ?? DEFAULT_DUOTONE_OPACITY} fill={duotoneColor} />
}

/**
 * Creates a Phosphor icon component from its pre-parsed SVG data. Used by the generated icons in
 * `src/phosphor/generated` — run `yarn phosphor:generate` instead of calling it by hand.
 */
export function createPhosphorIcon(displayName: string, data: PhosphorIconData): PhosphorIcon {
  const Component = forwardRef<SVGSVGElement, PhosphorIconProps>((props, ref) => {
    const defaults = useContext(PhosphorContext)
    const {
      weight = defaults.weight ?? 'regular',
      size = defaults.size ?? '1em',
      color = defaults.color ?? 'currentColor',
      mirrored = defaults.mirrored ?? false,
      duotoneColor = defaults.duotoneColor,
      duotoneOpacity = defaults.duotoneOpacity,
      title,
      children,
      style,
      ...rest
    } = props

    const shapes = data[weight] ?? data.regular
    const labelled = !!title || !!rest['aria-label'] || !!rest['aria-labelledby']

    return (
      <svg
        ref={ref}
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        viewBox='0 0 256 256'
        fill={color}
        role={labelled ? 'img' : undefined}
        aria-hidden={labelled ? undefined : true}
        focusable='false'
        style={mirrored ? { transform: 'scale(-1, 1)', ...style } : style}
        {...rest}
      >
        {title && <title>{title}</title>}
        {children}
        {shapes.map((shape, index) => renderShape(shape, index, duotoneColor, duotoneOpacity))}
      </svg>
    )
  })

  Component.displayName = displayName
  return Component
}
