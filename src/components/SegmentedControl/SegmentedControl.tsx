import React, { CSSProperties, useMemo, useState } from 'react'

import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { Icon, IconImage } from '../Icon'

export interface SegmentedControlOption {
  value: string
  label: React.ReactNode
  icon?: IconImage
  disabled?: boolean
}

export type SegmentedControlSize = 'small' | 'medium'

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'style'> {
  options: SegmentedControlOption[]

  /**
   * The selected option. Use together with `onChange`.
   */
  value?: string

  /**
   * Option selected at first when uncontrolled
   * @default the first option that is not disabled
   */
  defaultValue?: string

  onChange?(value: string): void

  /**
   * Name of the radio inputs, to submit the value with a form
   */
  name?: string

  /**
   * @default 'medium'
   */
  size?: SegmentedControlSize

  /**
   * Fills the width of the container, splitting it equally between the options
   */
  block?: boolean

  disabled?: boolean

  style?: ExternalStyles
}

/**
 * A set of exclusive options shown side by side, where one is always selected, to switch between views of
 * the same content. It is a group of radio buttons: the arrow keys move the selection.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  const { options, value, defaultValue, onChange, name, size = 'medium', block, disabled, style, ...rest } = props

  const { classes, css } = useStyles(createStyles)
  const generatedName = useMemo(() => `segmented-control-${randomStr()}`, [])

  const firstEnabled = options.find((option) => !option.disabled)
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? firstEnabled?.value)
  const isControlled = value !== undefined
  const selected = isControlled ? value : uncontrolledValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setUncontrolledValue(e.target.value)
    }
    onChange && onChange(e.target.value)
  }

  return (
    <div
      role='radiogroup'
      aria-disabled={disabled || undefined}
      className={css(classes.root, block && classes.block, style)}
      {...rest}
    >
      {options.map((option) => {
        const checked = option.value === selected
        const optionDisabled = disabled || option.disabled

        return (
          <label
            key={option.value}
            className={css(
              classes.segment,
              classes[size],
              checked && classes.checked,
              optionDisabled && classes.disabled
            )}
          >
            <input
              type='radio'
              name={name ?? generatedName}
              value={option.value}
              checked={checked}
              disabled={optionDisabled}
              onChange={handleChange}
              className={classes.input}
            />
            {option.icon && <Icon icon={option.icon} size={1} style={classes.icon} />}
            <span>{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    display: 'inline-flex',
    maxWidth: '100%',
  } as CSSProperties,
  block: {
    display: 'flex',
    width: '100%',
    '& > label': {
      flex: 1,
    },
  } as CSSProperties,
  segment: {
    ...theme.typography.variant('main'),
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: theme.typography.sizes.button,
    fontWeight: 'bold',
    lineHeight: '1.5rem',
    // Long labels break into lines when the options do not fit side by side, as on small phones
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    border: `1px solid ${theme.pallete.gray.c40}`,
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    transition: 'background .2s',
    '&:not(:first-of-type)': {
      marginLeft: -1,
    },
    '&:first-of-type': {
      borderTopLeftRadius: theme.radius.button,
      borderBottomLeftRadius: theme.radius.button,
    },
    '&:last-of-type': {
      borderTopRightRadius: theme.radius.button,
      borderBottomRightRadius: theme.radius.button,
    },
    '&:hover': {
      background: theme.pallete.gray.c90,
    },
    '&:focus-within': {
      zIndex: 2,
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  medium: {
    padding: 'calc(0.75rem - 1px) 1rem',
  } as CSSProperties,
  small: {
    padding: 'calc(0.25rem - 1px) calc(0.5rem - 1px)',
  } as CSSProperties,
  checked: {
    zIndex: 1,
    borderColor: theme.pallete.primary.main,
    background: theme.pallete.primary.main,
    color: theme.pallete.surface.main,
    '&:hover': {
      background: theme.pallete.primary.main,
    },
  } as CSSProperties,
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    '&:hover': {
      background: theme.pallete.surface.main,
    },
  } as CSSProperties,
  input: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    margin: 0,
    pointerEvents: 'none',
  } as CSSProperties,
  icon: {
    flexShrink: 0,
  } as CSSProperties,
})
