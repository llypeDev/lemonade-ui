// Phosphor Icons (https://phosphoricons.com) for the Lemonade Design System.
// Icons are vendored from @phosphor-icons/core under the MIT License — see vendor/phosphor/LICENSE.
//
// Import from `@lemonade/ui/phosphor`. Prefer named imports so bundlers only include the icons you use:
//   import { PhAirplane, PhosphorIconProvider } from '@lemonade/ui/phosphor'
//
// Types are re-exported as aliases instead of `export type { … }` so this file also compiles with older Babel
// toolchains (e.g. the Gatsby 2 documentation site).

import { PhosphorIcon as Icon } from './createPhosphorIcon'
import { PhosphorIconName as IconName } from './generated/names'
import { PhosphorIconProviderProps as ProviderProps } from './PhosphorContext'
import {
  PhosphorIconData as IconData,
  PhosphorIconDefaults as IconDefaults,
  PhosphorIconProps as IconProps,
  PhosphorShape as Shape,
  PhosphorWeight as Weight,
} from './types'

export * from './generated'
export { PHOSPHOR_ICON_COUNT, PHOSPHOR_VERSION } from './generated/names'
export { createPhosphorIcon } from './createPhosphorIcon'
export { PhosphorContext, PhosphorIconProvider } from './PhosphorContext'
export { PHOSPHOR_WEIGHTS } from './types'

export type PhosphorIconName = IconName
export type PhosphorIcon = Icon
export type PhosphorIconProviderProps = ProviderProps
export type PhosphorIconData = IconData
export type PhosphorIconDefaults = IconDefaults
export type PhosphorIconProps = IconProps
export type PhosphorShape = Shape
export type PhosphorWeight = Weight
