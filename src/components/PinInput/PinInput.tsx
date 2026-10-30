import React, { CSSProperties, useMemo, useRef, useState } from 'react'

import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { FormControl } from '../FormControl'

export type PinInputType = 'numeric' | 'alphanumeric'

export interface PinInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'style' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'maxLength' | 'size'
  > {
  /**
   * Number of characters of the code
   * @default 6
   */
  length?: number

  /**
   * Characters accepted: digits only, or digits and letters
   * @default 'numeric'
   */
  type?: PinInputType

  /**
   * Current code, for a controlled field
   */
  value?: string

  /**
   * Starting code of an uncontrolled field
   */
  defaultValue?: string

  /**
   * Called on every change, with the code so far
   */
  onChange?(value: string): void

  /**
   * Called when the code has all its characters, such as to send it right away
   */
  onComplete?(value: string): void

  /**
   * Shows dots instead of the characters, like a password
   * @default false
   */
  mask?: boolean

  label?: React.ReactNode
  error?: React.ReactNode
  style?: ExternalStyles
}

const patterns: Record<PinInputType, RegExp> = {
  numeric: /[^0-9]/g,
  alphanumeric: /[^0-9a-zA-Z]/g,
}

/**
 * Field for short codes, such as a verification code sent by SMS or email, shown as one box per character.
 * It is a single input underneath, so pasting the whole code and the one-time code autofill of phones work.
 */
export function PinInput(props: PinInputProps) {
  const {
    length = 6,
    type = 'numeric',
    value,
    defaultValue = '',
    onChange,
    onComplete,
    mask = false,
    label,
    error,
    required,
    disabled,
    id,
    style,
    onFocus,
    onBlur,
    onSelect,
    onPaste,
    ...rest
  } = props

  const { classes, css } = useStyles(createStyles, length)
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = useState(() => defaultValue.replace(patterns[type], '').slice(0, length))
  const [focused, setFocused] = useState(false)
  const ids = useMemo(() => {
    const suffix = randomStr()
    return { input: id ?? `pin-input-${suffix}`, error: `pin-input-error-${suffix}` }
  }, [id])

  const code = value !== undefined ? value : internalValue

  // Codes often come with spaces or dashes, such as "123-456". The input has no maxLength, which would cut
  // them before the separators are removed.
  const clean = (text: string) => text.replace(patterns[type], '').slice(0, length)

  const update = (next: string) => {
    if (next === code) {
      return
    }

    if (value === undefined) {
      setInternalValue(next)
    }
    onChange && onChange(next)

    if (next.length === length) {
      onComplete && onComplete(next)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => update(clean(e.target.value))

  // A pasted code replaces the one in the field, wherever the caret is
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste && onPaste(e)

    const pasted = clean(e.clipboardData.getData('text'))
    if (e.defaultPrevented || !pasted) {
      return
    }

    e.preventDefault()
    update(pasted)
  }

  // The caret stays at the end, where the next character goes. A selection, such as select all, stays, so the
  // user can type or paste over it.
  const keepCaretAtEnd = (input: HTMLInputElement) => {
    const end = input.value.length
    if (input.selectionStart === input.selectionEnd && input.selectionStart !== end) {
      input.setSelectionRange(end, end)
    }
  }

  const activeIndex = Math.min(code.length, length - 1)

  return (
    <FormControl label={label} htmlFor={ids.input} required={required} error={error} errorId={ids.error}>
      <div className={css(classes.root, style)}>
        <input
          ref={inputRef}
          id={ids.input}
          className={classes.input}
          type={mask ? 'password' : 'text'}
          inputMode={type === 'numeric' ? 'numeric' : 'text'}
          pattern={type === 'numeric' ? '[0-9]*' : '[0-9a-zA-Z]*'}
          autoComplete='one-time-code'
          autoCapitalize='off'
          autoCorrect='off'
          spellCheck={false}
          value={code}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.error : undefined}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={(e) => {
            setFocused(true)
            keepCaretAtEnd(e.currentTarget)
            onFocus && onFocus(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur && onBlur(e)
          }}
          onSelect={(e) => {
            keepCaretAtEnd(e.currentTarget)
            onSelect && onSelect(e)
          }}
          {...rest}
        />
        {Array.from({ length }, (_, index) => (
          <div
            key={index}
            aria-hidden='true'
            className={css(
              classes.box,
              !!error && classes.invalid,
              disabled && classes.disabled,
              focused && index === activeIndex && (error ? classes.activeInvalid : classes.active)
            )}
          >
            {code[index] && (mask ? '•' : code[index])}
          </div>
        ))}
      </div>
    </FormControl>
  )
}

const createStyles = (theme: Theme, length: number) => ({
  root: {
    position: 'relative',
    display: 'inline-grid',
    gridTemplateColumns: `repeat(${length}, 2.5rem)`,
    gap: '0.5rem',
    maxWidth: '100%',
  } as CSSProperties,
  input: {
    // Covers the boxes, so a click or a tap anywhere on them focuses the field
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: 'transparent',
    caretColor: 'transparent',
    // 16px keeps mobile browsers from zooming in on focus
    fontSize: 16,
    opacity: 0,
    cursor: 'text',
    '&:disabled': {
      cursor: 'not-allowed',
    },
  } as CSSProperties,
  box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    height: '3rem',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: theme.radius.input,
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    fontVariantNumeric: 'tabular-nums',
    transition: 'box-shadow .2s',
    pointerEvents: 'none',
  } as CSSProperties,
  active: {
    borderColor: theme.pallete.primary.main,
    boxShadow: focusBoxShadow(theme),
  } as CSSProperties,
  invalid: {
    borderColor: theme.pallete.status.danger.main,
  } as CSSProperties,
  activeInvalid: {
    boxShadow: focusBoxShadow(theme, 'danger'),
  } as CSSProperties,
  disabled: {
    borderColor: theme.pallete.gray.c80,
    background: theme.pallete.surface.background,
    color: theme.pallete.text.disabled,
  } as CSSProperties,
})
