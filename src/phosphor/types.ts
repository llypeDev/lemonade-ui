import React from 'react'

/** The six Phosphor weights, from lightest to heaviest, plus the two-tone variant. */
export type PhosphorWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

export const PHOSPHOR_WEIGHTS: ReadonlyArray<PhosphorWeight> = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone']

/**
 * A single SVG shape of an icon: the path data, or a `[pathData, opacity]` tuple for the background layer of the
 * duotone weight. Every shape is drawn on a 256×256 viewBox.
 */
export type PhosphorShape = string | [string, number]

export type PhosphorIconData = { readonly [weight in PhosphorWeight]: ReadonlyArray<PhosphorShape> }

/** Defaults shared through `PhosphorIconProvider`. Every field can be overridden per icon. */
export interface PhosphorIconDefaults {
  /** Icon weight. Defaults to `regular`. */
  weight?: PhosphorWeight
  /** Width and height (number in px or any CSS length). Defaults to `1em`, so icons follow the font size. */
  size?: number | string
  /** Fill color. Defaults to `currentColor`, so icons follow the text color. */
  color?: string
  /** Flips the icon horizontally (useful for RTL layouts). */
  mirrored?: boolean
  /** Color of the duotone background layer. Defaults to the icon color. */
  duotoneColor?: string
  /** Opacity of the duotone background layer. Defaults to `0.2`. */
  duotoneOpacity?: number
}

export interface PhosphorIconProps extends PhosphorIconDefaults, Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'color'> {
  /** Accessible name. When set, the icon is exposed as `role="img"` instead of being hidden from assistive tech. */
  title?: string
}
