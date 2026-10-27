import { css } from 'emotion'
import React, { useState } from 'react'

import { ExternalStyles, hexToRGB, Theme, useStyles, useTheme } from '../../styles'
import { Omit } from '../../util'
import {
  createInputStyles as createCheckboxInputStyles,
  createStyles as createCheckboxStyles,
} from '../Checkbox/Checkbox'
import { Input, InputProps } from '../Input'

import { CardVariant, createBaseStyles, createVariantStyles } from './cardVariants'

export interface ToggleCardProps extends Omit<InputProps, 'style' | 'type'> {
  style?: ExternalStyles

  /**
   * Defines the visual style of the Card
   * @default 'outline'
   */
  variant?: CardVariant

  /**
   * Specify whether the Card should have error appearance
   */
  invalid?: boolean
}

/**
 * A card that behaves like a checkbox, for selections that need more information than a checkbox label.
 * It renders a native checkbox, so `name`, `value`, `checked`, `defaultChecked` and `onChange` work as usual.
 */
export function ToggleCard(props: ToggleCardProps) {
  const { variant = 'outline', invalid, disabled, checked, defaultChecked, onChange, style, children, ...rest } = props

  const [uncontrolledChecked, setUncontrolledChecked] = useState(!!defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : uncontrolledChecked

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setUncontrolledChecked(event.target.checked)
    }
    onChange && onChange(event)
  }

  const theme = useTheme()
  const { classes: checkboxClasses } = useStyles(createCheckboxStyles)
  const { classes: inputClasses } = useStyles(createCheckboxInputStyles, checkboxClasses)
  const styles = createStyles(theme, variant, disabled, invalid, isChecked, style)

  return (
    <label className={styles.card}>
      <div className={styles.layout}>
        <span className={styles.control}>
          <Input
            {...rest}
            type='checkbox'
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            className={inputClasses.input}
          />
          <span className={checkboxClasses.check} />
        </span>
        <div className={styles.content}>{children}</div>
      </div>
    </label>
  )
}

const createStyles = (
  theme: Theme,
  variant: CardVariant,
  disabled: boolean,
  invalid: boolean,
  checked: boolean,
  externalStyles: ExternalStyles
) => {
  const baseStyles = createBaseStyles(theme)
  const variantStyles = createVariantStyles(theme)[variant]

  return {
    card: css(
      baseStyles.card,
      variantStyles.base,
      {
        ...theme.typography.variant('main'),
        display: 'block',
        cursor: 'pointer',
        ':hover': {
          background: hexToRGB(theme.pallete.gray.c50, 0.1),
        },
      },
      checked && {
        background: theme.pallete.primary.c90,
        borderColor: theme.pallete.primary.main,
        ':hover': {
          background: theme.pallete.primary.c80,
        },
      },
      invalid && variantStyles.invalid,
      invalid && { borderColor: theme.pallete.status.danger.main },
      disabled && baseStyles.cardDisabled,
      disabled && variantStyles.disabled,
      disabled && { ':hover': { background: theme.pallete.surface.main } },
      externalStyles
    ),
    layout: css({
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      alignItems: 'start',
      gap: '0.5rem',
    }),
    control: css({
      display: 'inline-flex',
      alignItems: 'center',
    }),
    content: css(disabled && baseStyles.innerDisabled),
  }
}
