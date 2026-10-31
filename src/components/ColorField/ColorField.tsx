import React, { CSSProperties, useMemo, useRef, useState } from 'react'

import { UseFormControlProps, useFormControl } from '../../hooks/useFormControl'
import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'
import { FormControl, FormError } from '../FormControl'
import { Icon } from '../Icon'

export interface ColorSwatch {
  /**
   * The color, as `#RRGGBB`
   */
  value: string

  /**
   * Name of the color for screen readers, such as "Green"
   */
  label: string
}

export interface ColorFieldProps extends UseFormControlProps {
  /**
   * The color as `#RRGGBB`, for a controlled field
   */
  value?: string

  /**
   * Color an uncontrolled field starts with
   */
  defaultValue?: string

  /**
   * Called with the new color as `#RRGGBB`
   */
  onChange?(value: string): void

  /**
   * Colors to pick from. Give each one a name, so screen readers say "Green" instead of its code.
   */
  swatches?: Array<string | ColorSwatch>

  /**
   * Shows a field for the hex code and a button for the color picker of the browser, to pick any color
   * @default true
   */
  allowCustom?: boolean

  disabled?: boolean
  style?: ExternalStyles
}

const defaultSwatches = ['#5E7300', '#0069D0', '#7F28C2', '#D01E29', '#E5741A', '#F2C94C', '#2F7D4E', '#5F606F']

const hexPattern = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Turns `#abc` and `abc` into `#AABBCC`, or returns `null` when the text is not a color
 */
export const normalizeHex = (text: string): string | null => {
  const match = hexPattern.exec(text.trim())
  if (!match) {
    return null
  }
  const digits = match[1].length === 3 ? match[1].replace(/./g, (digit) => digit + digit) : match[1]
  return `#${digits.toUpperCase()}`
}

// A dark check shows on light colors, and a white one on dark colors
const isLight = (hex: string) => {
  const channel = (start: number) => parseInt(hex.substr(start, 2), 16) / 255
  const [r, g, b] = [channel(1), channel(3), channel(5)].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4
}

/**
 * Field to pick a color, such as the color of a tag or of a category: a set of swatches and, optionally, a hex code
 * field and the color picker of the browser.
 */
export function ColorField(props: ColorFieldProps) {
  const {
    value,
    defaultValue,
    onChange,
    swatches = defaultSwatches,
    allowCustom = true,
    disabled,
    label,
    error,
    style,
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const { getFormControlProps, getInputProps } = useFormControl(props)
  const ids = useMemo(() => {
    const id = randomStr()
    return { swatches: `color-field-swatches-${id}`, invalid: `color-field-invalid-${id}` }
  }, [])
  const swatchRefs = useRef<HTMLButtonElement[]>([])

  const [internalValue, setInternalValue] = useState(() => normalizeHex(defaultValue || '') || '')
  const current = value !== undefined ? normalizeHex(value) || '' : internalValue
  const [text, setText] = useState<string>(null)
  const [invalid, setInvalid] = useState(false)

  const options: ColorSwatch[] = swatches.map((swatch) =>
    typeof swatch === 'string'
      ? { value: normalizeHex(swatch), label: normalizeHex(swatch) }
      : { ...swatch, value: normalizeHex(swatch.value) }
  )
  const checkedIndex = options.findIndex((option) => option.value === current)

  const select = (next: string) => {
    setText(null)
    setInvalid(false)
    if (next === current) {
      return
    }
    if (value === undefined) {
      setInternalValue(next)
    }
    onChange && onChange(next)
  }

  // The arrow keys move through the swatches and pick them, as in a group of radio buttons
  const handleSwatchKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    if (e.key in targets) {
      e.preventDefault()
      const target = targets[e.key]
      select(options[target].value)
      swatchRefs.current[target] && swatchRefs.current[target].focus()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setText(next)
    const color = normalizeHex(next)
    if (color) {
      setInvalid(false)
      if (color !== current) {
        if (value === undefined) {
          setInternalValue(color)
        }
        onChange && onChange(color)
      }
    }
  }

  // Leaving the field shows the color as #RRGGBB, or says the code is not a color
  const handleTextBlur = () => {
    if (text === null) {
      return
    }
    if (text.trim() === '' || normalizeHex(text)) {
      setText(null)
      setInvalid(false)
    } else {
      setInvalid(true)
    }
  }

  const { 'aria-labelledby': labelledBy } = getInputProps()
  const tabbableIndex = checkedIndex >= 0 ? checkedIndex : 0

  return (
    <FormControl {...getFormControlProps()}>
      <div
        role='group'
        aria-labelledby={labelledBy}
        aria-label={label && labelledBy ? undefined : locale.colorField.swatches}
        className={css(classes.root, style)}
      >
        <div role='radiogroup' aria-label={locale.colorField.swatches} className={classes.swatches}>
          {options.map((option, index) => {
            const checked = index === checkedIndex
            return (
              <button
                key={option.value}
                ref={(element) => (swatchRefs.current[index] = element)}
                type='button'
                role='radio'
                aria-checked={checked}
                aria-label={option.label}
                title={option.label}
                tabIndex={index === tabbableIndex ? 0 : -1}
                disabled={disabled}
                className={classes.swatch}
                style={{ background: option.value }}
                onClick={() => select(option.value)}
                onKeyDown={handleSwatchKeyDown(index)}
              >
                {checked && (
                  <Icon
                    icon='checkDefault'
                    size={1.25}
                    style={{ color: isLight(option.value) ? '#24252E' : '#FFFFFF' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {allowCustom && (
          <div className={classes.custom}>
            <span className={classes.preview} style={{ background: current || 'transparent' }} aria-hidden />
            <input
              type='text'
              className={css(classes.hex, (invalid || !!error) && classes.hexInvalid)}
              aria-label={locale.colorField.hex}
              placeholder='#RRGGBB'
              maxLength={7}
              spellCheck={false}
              autoComplete='off'
              disabled={disabled}
              value={text ?? current}
              aria-invalid={invalid || !!error || undefined}
              aria-describedby={invalid ? ids.invalid : undefined}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
            />
            <label className={css(classes.picker, disabled && classes.pickerDisabled)} title={locale.colorField.picker}>
              <Icon icon='penOutline' size={1.25} />
              <input
                type='color'
                className={classes.native}
                aria-label={locale.colorField.picker}
                disabled={disabled}
                value={(current || '#000000').toLowerCase()}
                onChange={(e) => select(normalizeHex(e.target.value))}
              />
            </label>
          </div>
        )}
        {invalid && (
          <FormError id={ids.invalid} role='alert' style={classes.error}>
            {locale.colorField.invalid}
          </FormError>
        )}
      </div>
    </FormControl>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
  } as CSSProperties,
  swatches: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  } as CSSProperties,
  swatch: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    margin: 0,
    padding: 0,
    border: '1px solid rgba(0, 0, 0, 0.16)',
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 'none',
    transition: 'transform .15s',
    '&:hover:not(:disabled)': {
      transform: 'scale(1.1)',
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  custom: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
  } as CSSProperties,
  preview: {
    flexShrink: 0,
    width: '2rem',
    height: '2rem',
    boxSizing: 'border-box',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: theme.radius.input,
    // A checkered pattern shows through when there is no color
    backgroundImage: `linear-gradient(45deg, ${theme.pallete.divider} 25%, transparent 25%, transparent 75%, ${theme.pallete.divider} 75%)`,
    backgroundSize: '0.5rem 0.5rem',
  } as CSSProperties,
  hex: {
    width: '7rem',
    boxSizing: 'border-box',
    height: '2rem',
    margin: 0,
    padding: '0 0.5rem',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: theme.radius.input,
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.sizes.text,
    textTransform: 'uppercase',
    outline: 'none',
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
    '&:disabled': {
      borderColor: theme.pallete.gray.c80,
      background: theme.pallete.surface.background,
    },
  } as CSSProperties,
  hexInvalid: {
    borderColor: theme.pallete.status.danger.main,
    '&:focus': {
      boxShadow: focusBoxShadow(theme, 'danger'),
    },
  } as CSSProperties,
  picker: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderRadius: theme.radius.button,
    color: theme.pallete.text.secondary,
    cursor: 'pointer',
    '&:hover': {
      background: theme.pallete.surface.background,
      color: theme.pallete.text.main,
    },
    '&:focus-within': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  pickerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
  native: {
    // The input of the browser covers the button, invisible, so a click opens its picker
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    border: 0,
    opacity: 0,
    cursor: 'inherit',
  } as CSSProperties,
  error: {
    marginTop: '0.25rem',
  } as CSSProperties,
})
