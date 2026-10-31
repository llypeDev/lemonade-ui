import React, { CSSProperties, useMemo, useRef, useState } from 'react'

import { UseFormControlProps, useFormControl } from '../../hooks/useFormControl'
import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { FormControl } from '../FormControl'
import { Icon } from '../Icon'
import { VisuallyHidden } from '../VisuallyHidden'

export interface TagInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'style' | 'value' | 'defaultValue' | 'onChange' | 'required'
    >,
    UseFormControlProps {
  /**
   * The values, for a controlled field
   */
  value?: string[]

  /**
   * Values an uncontrolled field starts with
   * @default []
   */
  defaultValue?: string[]

  /**
   * Called with all the values when the user adds or removes one
   */
  onChange?(values: string[]): void

  /**
   * Checks a value. Values that fail stay in the field, marked as not valid, so the user can see and remove them.
   */
  validate?(value: string): boolean

  /**
   * Keys that add the typed text, besides Enter. Pasted text is also split by them and by line breaks.
   * @default [',', ';']
   */
  separators?: string[]

  /**
   * Keeps values that are already in the field
   * @default false
   */
  allowDuplicates?: boolean

  /**
   * Largest number of values
   */
  max?: number

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Field for a list of short free values, such as email addresses or keywords, shown as tags. Enter or a comma
 * adds the typed text, pasting a list adds each item, and Backspace removes the last tag.
 * To pick values from a known list, use `Combobox` with `multiple`.
 */
export function TagInput(props: TagInputProps) {
  const {
    value,
    defaultValue = [],
    onChange,
    validate,
    separators = [',', ';'],
    allowDuplicates = false,
    max,
    label,
    error,
    required,
    inline,
    disabled,
    placeholder,
    style,
    onKeyDown,
    onPaste,
    onBlur,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const { getFormControlProps, getInputProps } = useFormControl(props)
  const inputRef = useRef<HTMLInputElement>(null)
  const instructionsId = useMemo(() => `tag-input-${randomStr()}`, [])

  const [internalValue, setInternalValue] = useState(defaultValue)
  const [text, setText] = useState('')
  const [announcement, setAnnouncement] = useState('')

  const tags = value ?? internalValue
  const full = max !== undefined && tags.length >= max

  const update = (next: string[]) => {
    if (value === undefined) {
      setInternalValue(next)
    }
    onChange && onChange(next)
  }

  // Adds each new value, skipping empty ones, repeated ones and those over the limit
  const add = (candidates: string[]) => {
    const next = [...tags]
    const added: string[] = []

    candidates
      .map((candidate) => candidate.trim())
      .filter(Boolean)
      .forEach((candidate) => {
        const repeated = !allowDuplicates && next.includes(candidate)
        const over = max !== undefined && next.length >= max
        if (!repeated && !over) {
          next.push(candidate)
          added.push(candidate)
        }
      })

    if (added.length > 0) {
      update(next)
      setAnnouncement(added.map((tag) => fill(locale.tagInput.added, { tag })).join(' '))
    }
  }

  const remove = (index: number) => {
    const tag = tags[index]
    update(tags.filter((_, other) => other !== index))
    setAnnouncement(fill(locale.tagInput.removed, { tag }))
  }

  const commit = () => {
    if (text.trim()) {
      add([text])
    }
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown && onKeyDown(e)
    if (e.defaultPrevented) {
      return
    }

    // Enter without text is left alone, so it can still send the form
    if ((e.key === 'Enter' && text.trim()) || separators.includes(e.key)) {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && text === '' && tags.length > 0) {
      e.preventDefault()
      remove(tags.length - 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste && onPaste(e)
    const pasted = e.clipboardData.getData('text')
    const splitter = new RegExp(`[${separators.map(escapeRegExp).join('')}\\n\\r\\t]`)

    if (!e.defaultPrevented && splitter.test(pasted)) {
      e.preventDefault()
      add([text + pasted.split(splitter)[0], ...pasted.split(splitter).slice(1)])
      setText('')
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur && onBlur(e)
    commit()
  }

  const handleRemove = (index: number) => () => {
    remove(index)
    inputRef.current.focus()
  }

  // A click on the empty area of the box goes to the field
  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      inputRef.current.focus()
    }
  }

  const invalidField = !!error || tags.some((tag) => validate && !validate(tag))

  return (
    <FormControl {...getFormControlProps()}>
      <div
        className={css(classes.box, invalidField && classes.invalid, disabled && classes.disabled, style)}
        onClick={handleBoxClick}
      >
        {tags.map((tag, index) => {
          const valid = !validate || validate(tag)
          return (
            <span key={`${tag}-${index}`} className={css(classes.tag, !valid && classes.invalidTag)}>
              <span className={css(classes.text, disabled && classes.textOnly)}>{tag}</span>
              {!valid && <VisuallyHidden>, {locale.tagInput.invalid}</VisuallyHidden>}
              {!disabled && (
                <button
                  type='button'
                  className={classes.remove}
                  aria-label={fill(locale.tagInput.remove, { tag })}
                  title={fill(locale.tagInput.remove, { tag })}
                  onClick={handleRemove(index)}
                >
                  <Icon icon='timesDefault' size={1} />
                </button>
              )}
            </span>
          )
        })}
        <input
          ref={inputRef}
          className={classes.input}
          value={text}
          disabled={disabled}
          required={required && tags.length === 0}
          placeholder={tags.length === 0 ? placeholder : undefined}
          aria-describedby={instructionsId}
          readOnly={full}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          {...getInputProps()}
          aria-invalid={invalidField || undefined}
          {...rest}
        />
      </div>
      <VisuallyHidden id={instructionsId}>{locale.tagInput.instructions}</VisuallyHidden>
      <VisuallyHidden role='status'>{announcement}</VisuallyHidden>
    </FormControl>
  )
}

const createStyles = (theme: Theme) => ({
  box: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.25rem',
    boxSizing: 'border-box',
    minHeight: '2rem',
    padding: 'calc(0.25rem - 1px)',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: theme.radius.input,
    background: theme.pallete.surface.main,
    cursor: 'text',
    transition: 'box-shadow .2s',
    '&:hover': {
      borderColor: theme.pallete.gray.c50,
    },
    '&:focus-within': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  invalid: {
    borderColor: theme.pallete.status.danger.main,
    '&:hover': {
      borderColor: theme.pallete.status.danger.main,
    },
    '&:focus-within': {
      boxShadow: focusBoxShadow(theme, 'danger'),
    },
  } as CSSProperties,
  disabled: {
    borderColor: theme.pallete.gray.c80,
    background: theme.pallete.surface.background,
    cursor: 'not-allowed',
  } as CSSProperties,
  tag: {
    ...theme.typography.variant('main'),
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    minHeight: '1.5rem',
    boxSizing: 'border-box',
    paddingLeft: '0.5rem',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.button,
    background: theme.pallete.surface.background,
    fontWeight: 'bold',
    lineHeight: '1rem',
  } as CSSProperties,
  invalidTag: {
    borderColor: theme.pallete.status.danger.main,
    background: theme.pallete.status.danger.background,
    color: theme.pallete.status.danger.main,
  } as CSSProperties,
  text: {
    minWidth: 0,
    overflowWrap: 'anywhere',
    paddingRight: '0.25rem',
  } as CSSProperties,
  textOnly: {
    // Without the remove button, the text gets the same space on both sides
    paddingRight: '0.5rem',
  } as CSSProperties,
  remove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '1.375rem',
    height: '1.375rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: theme.radius.button,
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      color: theme.pallete.status.danger.main,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
  } as CSSProperties,
  input: {
    flex: '1 1 6rem',
    minWidth: '6rem',
    height: '1.5rem',
    margin: 0,
    padding: '0 0.25rem',
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: theme.pallete.text.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.sizes.text,
    '&::placeholder': {
      color: theme.pallete.text.secondary,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  } as CSSProperties,
})
