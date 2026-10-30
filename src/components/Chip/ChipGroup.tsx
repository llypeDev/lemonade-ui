import React, { CSSProperties, useMemo, useState } from 'react'

import { ExternalStyles, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface ChipGroupContextValue {
  isSelected(value: string): boolean
  toggle(value: string): void
}

export const ChipGroupContext = React.createContext<ChipGroupContextValue>(null)

export interface ChipGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'onChange' | 'defaultValue'> {
  /**
   * Values of the selected chips, for a controlled group
   */
  value?: string[]

  /**
   * Values of the chips an uncontrolled group starts with
   * @default []
   */
  defaultValue?: string[]

  /**
   * Called when the user turns a chip on or off, with the values of the selected chips
   */
  onChange?(value: string[]): void

  children?: React.ReactNode
  style?: ExternalStyles
}

/**
 * Group of `Chip`s where the user turns on any number of them, such as the filters of a list. Name it with
 * `aria-label`. For a single choice, use a `SegmentedControl`.
 */
export function ChipGroup(props: ChipGroupProps) {
  const { value, defaultValue = [], onChange, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selected = value ?? internalValue

  const context = useMemo<ChipGroupContextValue>(
    () => ({
      isSelected: (chip) => selected.includes(chip),
      toggle: (chip) => {
        const next = selected.includes(chip) ? selected.filter((item) => item !== chip) : [...selected, chip]
        if (value === undefined) {
          setInternalValue(next)
        }
        onChange && onChange(next)
      },
    }),
    [selected, value, onChange]
  )

  return (
    <ChipGroupContext.Provider value={context}>
      <div role='group' className={css(classes.group, style)} {...rest} />
    </ChipGroupContext.Provider>
  )
}

const createStyles = () => ({
  group: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,
})
