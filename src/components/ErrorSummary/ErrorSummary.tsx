import React, { CSSProperties, useEffect, useMemo, useRef } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { Icon } from '../Icon'
import { Link } from '../Link'

export interface ErrorSummaryItem {
  /**
   * Id of the field with the error. The message becomes a link that moves the focus to that field.
   */
  fieldId?: string

  /**
   * What is wrong and how to fix it, such as "Enter your email address". Use the same text as the error under
   * the field.
   */
  message: React.ReactNode
}

export interface ErrorSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  errors: ErrorSummaryItem[]

  /**
   * @default "There is a problem", from the locale strings
   */
  title?: React.ReactNode

  /**
   * Text between the title and the list, such as "Check the fields below before you continue."
   */
  description?: React.ReactNode

  /**
   * Moves the focus to the summary when it appears, so the user hears the errors and finds them first
   * @default true
   */
  autoFocus?: boolean

  /**
   * Any value, such as the number of times the form was submitted. Each time it changes, the summary takes the
   * focus again.
   */
  focusKey?: unknown

  style?: ExternalStyles
}

const focusableSelector = 'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]'

/**
 * Moves the focus to a field and scrolls its label, or the legend of its group, into view
 */
export const focusField = (id: string) => {
  const element = document.getElementById(id)
  if (!element) {
    return false
  }

  const field = element.matches(focusableSelector)
    ? element
    : element.querySelector<HTMLElement>(focusableSelector) ?? element
  const fieldset = element.closest('fieldset')
  const labels = (field as HTMLInputElement).labels
  const label: Element = (fieldset && fieldset.querySelector('legend')) ?? (labels && labels[0]) ?? field

  label.scrollIntoView && label.scrollIntoView()
  field.focus({ preventScroll: true })
  return true
}

/**
 * List of the errors of a form, shown at the top after the user submits it. It takes the focus, and each error
 * links to its field.
 */
export function ErrorSummary(props: ErrorSummaryProps) {
  const { errors, title, description, autoFocus = true, focusKey, style, ...rest } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const rootRef = useRef<HTMLDivElement>(null)
  const titleId = useMemo(() => `error-summary-${randomStr()}`, [])
  const hasErrors = errors.length > 0

  useEffect(() => {
    if (autoFocus && hasErrors) {
      rootRef.current.focus()
    }
  }, [autoFocus, hasErrors, focusKey])

  if (!hasErrors) {
    return null
  }

  const handleClick = (fieldId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (focusField(fieldId)) {
      e.preventDefault()
    }
  }

  return (
    <div
      ref={rootRef}
      role='alert'
      aria-labelledby={titleId}
      tabIndex={-1}
      className={css(classes.root, style)}
      {...rest}
    >
      <h2 id={titleId} className={classes.title}>
        <Icon icon='exclamationTriangleFilled' size={1.25} style={classes.icon} />
        {title ?? locale.errorSummary.title}
      </h2>
      {description && <p className={classes.description}>{description}</p>}
      <ul className={classes.list}>
        {errors.map((error, index) => (
          <li key={error.fieldId ?? index}>
            {error.fieldId ? (
              <Link href={`#${error.fieldId}`} color='danger' fontWeight='bold' onClick={handleClick(error.fieldId)}>
                {error.message}
              </Link>
            ) : (
              <span className={classes.text}>{error.message}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    boxSizing: 'border-box',
    padding: '1rem',
    border: `1px solid ${theme.pallete.status.danger.main}`,
    borderLeftWidth: '0.25rem',
    borderRadius: theme.radius.paper,
    background: theme.pallete.surface.main,
    outline: 'none',
    '&:focus': {
      boxShadow: focusBoxShadow(theme, 'danger'),
    },
  } as CSSProperties,
  title: {
    ...theme.typography.variant('h4'),
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: 0,
  } as CSSProperties,
  icon: {
    flexShrink: 0,
    color: theme.pallete.status.danger.main,
  } as CSSProperties,
  description: {
    margin: '0.5rem 0 0',
  } as CSSProperties,
  list: {
    margin: '0.5rem 0 0',
    paddingLeft: '1.75rem',
    '& li + li': {
      marginTop: '0.25rem',
    },
  } as CSSProperties,
  text: {
    color: theme.pallete.status.danger.main,
    fontWeight: 'bold',
  } as CSSProperties,
})
