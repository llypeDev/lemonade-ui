import React, { useContext, useMemo } from 'react'

import { PhosphorIconDefaults } from './types'

export const PhosphorContext = React.createContext<PhosphorIconDefaults>({})

export interface PhosphorIconProviderProps extends PhosphorIconDefaults {
  children?: React.ReactNode
}

/**
 * Sets default props (weight, size, color, mirrored, duotone styling) for every Phosphor icon rendered inside it.
 * Providers can be nested; inner values override outer ones.
 */
export function PhosphorIconProvider(props: PhosphorIconProviderProps) {
  const { children, weight, size, color, mirrored, duotoneColor, duotoneOpacity } = props
  const parent = useContext(PhosphorContext)

  const value = useMemo<PhosphorIconDefaults>(() => {
    const next: PhosphorIconDefaults = { ...parent }
    if (weight !== undefined) next.weight = weight
    if (size !== undefined) next.size = size
    if (color !== undefined) next.color = color
    if (mirrored !== undefined) next.mirrored = mirrored
    if (duotoneColor !== undefined) next.duotoneColor = duotoneColor
    if (duotoneOpacity !== undefined) next.duotoneOpacity = duotoneOpacity
    return next
  }, [parent, weight, size, color, mirrored, duotoneColor, duotoneOpacity])

  return <PhosphorContext.Provider value={value}>{children}</PhosphorContext.Provider>
}
