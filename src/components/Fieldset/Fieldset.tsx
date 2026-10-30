import React, { CSSProperties, useMemo } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { FormError } from '../FormControl'

export interface FieldsetProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'style'> {
  /**
   * Title of the group, such as "Shipping address", read by screen readers before each field of the group
   */
  legend: React.ReactNode

  /**
   * Text below the legend that helps to fill the group
   */
  description?: React.ReactNode

  /**
   * Error of the group as a whole, such as "Pick at least one day"
   */
  error?: React.ReactNode

  /**
   * Marks the legend as required, for a group where at least one answer is needed
   */
  required?: boolean

  /**
   * Disables every field inside the group
   */
  disabled?: boolean

  children?: React.ReactNode
  style?: ExternalStyles
}

/**
 * Group of related fields of a form, such as an address or a set of checkboxes, with a legend that names it.
 */
export function Fieldset(props: FieldsetProps) {
  const { legend, description, error, required, children, style, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const ids = useMemo(() => {
    const id = randomStr()
    return { description: `fieldset-description-${id}`, error: `fieldset-error-${id}` }
  }, [])

  const describedBy = [description && ids.description, error && ids.error].filter(Boolean).join(' ') || undefined

  return (
    <fieldset className={css(classes.fieldset, style)} aria-describedby={describedBy} {...rest}>
      <legend className={classes.legend}>
        {legend}
        {required && (
          <span title={locale.formControl.required} className={classes.marker}>
            *
          </span>
        )}
      </legend>
      {description && (
        <div id={ids.description} className={classes.description}>
          {description}
        </div>
      )}
      <div className={classes.fields}>{children}</div>
      {error && (
        <FormError id={ids.error} role='alert' style={classes.error}>
          {error}
        </FormError>
      )}
    </fieldset>
  )
}

const createStyles = (theme: Theme) => ({
  fieldset: {
    ...theme.typography.variant('main'),
    minWidth: 0,
    margin: 0,
    padding: 0,
    border: 0,
  } as CSSProperties,
  legend: {
    ...theme.typography.variant('h4'),
    padding: 0,
    marginBottom: '0.25rem',
  } as CSSProperties,
  marker: {
    color: theme.pallete.status.danger.main,
    marginLeft: '0.25rem',
  } as CSSProperties,
  description: {
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  fields: {
    display: 'grid',
    gap: '1rem',
    marginTop: '1rem',
  } as CSSProperties,
  error: {
    marginTop: '0.5rem',
  } as CSSProperties,
})
