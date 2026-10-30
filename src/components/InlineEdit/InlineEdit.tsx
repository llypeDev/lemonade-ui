import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { isPromise, Omit } from '../../util'
import { randomStr } from '../../util/string'
import { Button } from '../Button'
import { FormError } from '../FormControl'
import { Icon } from '../Icon'
import { TextInputBase } from '../TextField/TextInputBase'
import { VisuallyHidden } from '../VisuallyHidden'

export interface InlineEditProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'defaultValue'> {
  /**
   * What the text is, such as "Project name". It names the edit button and the field for screen readers.
   */
  label: string

  /**
   * Current text, for a controlled component
   */
  value?: string

  /**
   * Starting text of an uncontrolled component
   * @default ''
   */
  defaultValue?: string

  /**
   * Called with the new text when the user saves it. While a returned promise is pending, the field waits; if
   * it rejects, the field stays open so the user can try again.
   */
  onSave?(value: string): void | Promise<unknown>

  /**
   * Checks the text before saving. Return a message to show it and keep the field open.
   */
  validate?(value: string): React.ReactNode | undefined

  /**
   * Text shown when there is no value, such as "Add a description"
   */
  placeholder?: string

  /**
   * Maximum number of characters
   */
  maxLength?: number

  /**
   * Starts with the field open and focused, such as right after the user creates the item
   * @default false
   */
  defaultEditing?: boolean

  style?: ExternalStyles
}

/**
 * Text that turns into a field when clicked, to change it in place, such as the name of a project or a file.
 * Enter or the check button saves, and Escape or the cancel button goes back.
 */
export function InlineEdit(props: InlineEditProps) {
  const {
    label,
    value,
    defaultValue = '',
    onSave,
    validate,
    placeholder,
    maxLength,
    defaultEditing = false,
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const isMounted = useIsMounted()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const viewRef = useRef<HTMLButtonElement>(null)
  const errorId = useMemo(() => `inline-edit-error-${randomStr()}`, [])

  const [internalValue, setInternalValue] = useState(defaultValue)
  const [editing, setEditing] = useState(defaultEditing)
  const [draft, setDraft] = useState(() => value ?? defaultValue)
  const [error, setError] = useState<React.ReactNode>(null)
  const [saving, setSaving] = useState(false)
  // Moves the focus back to the text only after the user closes the field, not on the first render
  const returnFocus = useRef(false)

  const current = value ?? internalValue

  useEffect(() => {
    if (editing) {
      inputRef.current.focus()
      inputRef.current.select()
    } else if (returnFocus.current) {
      returnFocus.current = false
      viewRef.current && viewRef.current.focus()
    }
  }, [editing])

  const start = () => {
    setDraft(current)
    setError(null)
    setEditing(true)
  }

  const close = () => {
    returnFocus.current = rootRef.current.contains(document.activeElement)
    setEditing(false)
    setError(null)
  }

  const save = () => {
    if (saving) {
      return
    }

    if (draft === current) {
      close()
      return
    }

    const message = validate && validate(draft)
    if (message) {
      setError(message)
      inputRef.current.focus()
      return
    }

    const done = () => {
      if (value === undefined) {
        setInternalValue(draft)
      }
      close()
    }

    const result = onSave && onSave(draft)
    if (isPromise(result)) {
      setSaving(true)
      result.then(
        () => {
          if (isMounted.current) {
            setSaving(false)
            done()
          }
        },
        () => {
          if (isMounted.current) {
            setSaving(false)
            inputRef.current && inputRef.current.focus()
          }
        }
      )
      return
    }

    done()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  // Keeps the focus in the field when the buttons are pressed, so a click on cancel does not save on blur first,
  // in browsers that do not focus buttons on click
  const keepFocus = (e: React.MouseEvent) => e.preventDefault()

  // Leaving the field saves, unless the focus goes to the save or cancel button
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null
    if (editing && !saving && !(next && rootRef.current.contains(next))) {
      save()
    }
  }

  return (
    <div ref={rootRef} className={css(classes.root, style)} onBlur={handleBlur} {...rest}>
      {editing ? (
        <div className={classes.editor}>
          <div className={classes.row}>
            <TextInputBase
              inputRef={inputRef}
              aria-label={label}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              invalid={!!error}
              value={draft}
              maxLength={maxLength}
              placeholder={placeholder}
              // Read only, not disabled, while saving: a disabled field would lose the focus
              readOnly={saving}
              aria-busy={saving || undefined}
              onChange={(e) => {
                setDraft(e.target.value)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
            />
            <Button
              size='small'
              kind='primary'
              aria-label={locale.inlineEdit.save}
              title={locale.inlineEdit.save}
              loading={saving}
              onMouseDown={keepFocus}
              onClick={save}
            >
              <Icon icon='checkDefault' />
            </Button>
            <Button
              size='small'
              aria-label={locale.inlineEdit.cancel}
              title={locale.inlineEdit.cancel}
              disabled={saving}
              onMouseDown={keepFocus}
              onClick={close}
            >
              <Icon icon='timesDefault' />
            </Button>
          </div>
          {error && (
            <FormError id={errorId} role='alert' style={classes.error}>
              {error}
            </FormError>
          )}
        </div>
      ) : (
        <button ref={viewRef} type='button' className={classes.view} onClick={start}>
          <span className={css(classes.text, !current && classes.placeholder)}>{current || placeholder}</span>
          <Icon icon='penOutline' size={1} style={classes.pen} />
          <VisuallyHidden>
            {', '}
            {locale.inlineEdit.edit} {label}
          </VisuallyHidden>
        </button>
      )}
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    minWidth: 0,
  } as CSSProperties,
  view: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    maxWidth: '100%',
    boxSizing: 'border-box',
    minHeight: '2rem',
    margin: 0,
    // Lines the text up with the text of the field that replaces it
    padding: 'calc(0.25rem - 1px) calc(0.5rem - 1px)',
    marginLeft: 'calc(-0.5rem + 1px)',
    border: '1px solid transparent',
    borderRadius: theme.radius.input,
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'text',
    outline: 'none',
    '&:hover': {
      background: theme.pallete.surface.background,
      borderColor: theme.pallete.divider,
    },
    '&:hover svg, &:focus svg': {
      opacity: 1,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  text: {
    minWidth: 0,
    overflowWrap: 'anywhere',
  } as CSSProperties,
  placeholder: {
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  pen: {
    flexShrink: 0,
    opacity: 0,
    color: theme.pallete.text.secondary,
    transition: 'opacity .2s',
    // Touch screens have no hover, so the pen always shows there
    '@media (hover: none)': {
      opacity: 1,
    },
  } as CSSProperties,
  editor: {
    minWidth: 0,
  } as CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  } as CSSProperties,
  error: {
    marginTop: '0.25rem',
  } as CSSProperties,
})
