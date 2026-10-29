import React, { CSSProperties, useEffect, useMemo, useState } from 'react'

import { useFormControl } from '../../hooks/useFormControl'
import { useLocale } from '../../i18n'
import { Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { getUserLocale } from '../../util/locale'
import { randomStr } from '../../util/string'
import { FormControl } from '../FormControl'
import { Icon } from '../Icon'
import { TextFieldProps } from '../TextField'
import { TextInputBase } from '../TextField/TextInputBase'

export interface NumberFieldProps
  extends Omit<
    TextFieldProps,
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'min'
    | 'max'
    | 'step'
    | 'icon'
    | 'iconPosition'
    | 'iconAriaLabel'
    | 'iconDisabled'
    | 'onIconClick'
    | 'iconProps'
    | 'iconRef'
    | 'clearable'
    | 'onClear'
  > {
  /**
   * The number, or `null` when the field is empty. Use together with `onChange`.
   */
  value?: number | null

  /**
   * Starting number when uncontrolled
   */
  defaultValue?: number | null

  /**
   * Called with the new number, or `null` when the field is emptied
   */
  onChange?(value: number | null): void

  min?: number
  max?: number

  /**
   * Amount added or removed by the buttons and the arrow keys. `PageUp` and `PageDown` use 10 steps.
   * @default 1
   */
  step?: number
}

/**
 * Field for a number, such as a quantity, with buttons to add and remove one step.
 * It accepts both `.` and `,` as the decimal separator and shows the one of the user's locale.
 */
export function NumberField(props: NumberFieldProps) {
  const {
    id,
    value,
    defaultValue = null,
    onChange,
    min,
    max,
    step = 1,
    disabled,
    readOnly,
    label,
    error,
    required,
    inline,
    invalid,
    onBlur,
    onKeyDown,
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const { getFormControlProps, getInputProps } = useFormControl(props)
  const inputProps = getInputProps()
  const generatedId = useMemo(() => `number-field-${randomStr()}`, [])
  const inputId = id ?? generatedId
  const separator = useMemo(getDecimalSeparator, [])

  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(defaultValue)
  const currentValue = isControlled ? value : uncontrolledValue
  const [text, setText] = useState(() => formatNumber(currentValue, separator))

  // Shows a new value given by the parent, unless it is what the user is typing
  useEffect(() => {
    if (parseNumber(text) !== currentValue) {
      setText(formatNumber(currentValue, separator))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, separator])

  const commit = (next: number | null) => {
    if (!isControlled) {
      setUncontrolledValue(next)
    }
    if (next !== currentValue) {
      onChange && onChange(next)
    }
  }

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))

  const stepBy = (steps: number) => {
    const base = currentValue ?? (min !== undefined && min > 0 ? min : 0)
    const next = clamp(roundTo(base + steps * step, Math.max(decimals(step), decimals(base))))
    setText(formatNumber(next, separator))
    commit(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = e.target.value
    const parsed = parseNumber(nextText)
    setText(nextText)

    // While the text is not a number yet (such as "-" or "1,"), the value stays as it was
    if (parsed !== undefined) {
      commit(parsed)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseNumber(text)
    const next = parsed === undefined ? currentValue : parsed === null ? null : clamp(parsed)
    setText(formatNumber(next, separator))
    commit(next)
    onBlur && onBlur(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown && onKeyDown(e)
    if (e.defaultPrevented || disabled || readOnly) {
      return
    }

    const keySteps: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }

    if (keySteps[e.key] !== undefined) {
      e.preventDefault()
      stepBy(keySteps[e.key])
    } else if (e.key === 'Home' && min !== undefined) {
      e.preventDefault()
      setText(formatNumber(min, separator))
      commit(min)
    } else if (e.key === 'End' && max !== undefined) {
      e.preventDefault()
      setText(formatNumber(max, separator))
      commit(max)
    }
  }

  const locked = disabled || readOnly
  const canDecrease = !locked && (currentValue === null || min === undefined || currentValue > min)
  const canIncrease = !locked && (currentValue === null || max === undefined || currentValue < max)
  const isInvalid = invalid || inputProps['aria-invalid']

  return (
    <FormControl {...getFormControlProps()} htmlFor={inputId}>
      <div className={css(classes.group, isInvalid && classes.invalid)}>
        <button
          type='button'
          tabIndex={-1}
          aria-label={locale.numberField.decrease}
          aria-controls={inputId}
          disabled={!canDecrease}
          className={css(classes.button, classes.decrease)}
          onClick={() => stepBy(-1)}
        >
          <Icon icon='minus' size={1} />
        </button>
        <TextInputBase
          {...inputProps}
          {...rest}
          id={inputId}
          role='spinbutton'
          inputMode='decimal'
          autoComplete='off'
          aria-valuenow={currentValue ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-required={required || undefined}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          invalid={isInvalid}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={css(classes.input, style)}
        />
        <button
          type='button'
          tabIndex={-1}
          aria-label={locale.numberField.increase}
          aria-controls={inputId}
          disabled={!canIncrease}
          className={css(classes.button, classes.increase)}
          onClick={() => stepBy(1)}
        >
          <Icon icon='plus' size={1} />
        </button>
      </div>
    </FormControl>
  )
}

const numberPattern = /^-?(\d+\.?\d*|\.\d+)$/

/**
 * Returns the number in the text, `null` when it is empty, or `undefined` when it is not a number
 */
export const parseNumber = (text: string): number | null | undefined => {
  const normalized = text.trim().replace(',', '.')

  if (normalized === '') {
    return null
  }

  return numberPattern.test(normalized) ? Number(normalized) : undefined
}

const formatNumber = (value: number | null, separator: string) =>
  value === null || value === undefined ? '' : String(value).replace('.', separator)

const getDecimalSeparator = () => {
  try {
    return (1.5).toLocaleString(getUserLocale()).charAt(1) === ',' ? ',' : '.'
  } catch {
    return '.'
  }
}

const decimals = (n: number) => {
  const [, fraction = ''] = String(n).split('.')
  return fraction.length
}

const roundTo = (n: number, digits: number) => Number(n.toFixed(digits))

const createStyles = (theme: Theme) => ({
  group: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
  } as CSSProperties,
  input: {
    flex: 1,
    minWidth: '3rem',
    borderRadius: 0,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  } as CSSProperties,
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '2rem',
    padding: 0,
    border: `1px solid ${theme.pallete.gray.c60}`,
    background: theme.pallete.surface.background,
    color: theme.pallete.text.main,
    cursor: 'pointer',
    ':not(:disabled):hover': {
      background: theme.pallete.gray.c80,
    },
    ':disabled': {
      cursor: 'not-allowed',
      color: theme.pallete.text.disabled,
    },
  } as CSSProperties,
  decrease: {
    borderRight: 'none',
    borderRadius: `${theme.radius.input}px 0 0 ${theme.radius.input}px`,
  } as CSSProperties,
  increase: {
    borderLeft: 'none',
    borderRadius: `0 ${theme.radius.input}px ${theme.radius.input}px 0`,
  } as CSSProperties,
  invalid: {
    '& > button': {
      borderColor: theme.pallete.status.danger.main,
    },
  } as CSSProperties,
})
