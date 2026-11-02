import React, { CSSProperties, useState } from 'react'

import { useFormControl, UseFormControlProps } from '../../hooks/useFormControl'
import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util/types'
import { FormControl, FormError } from '../FormControl'
import { createStyles as createTextInputBaseStyles } from '../TextField/TextInputBase'

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'>,
    UseFormControlProps {
  style?: ExternalStyles
  resize?: CSSProperties['resize']
}

export function TextArea(props: TextAreaProps) {
  const { style, label, resize, error, inline, onChange, ...rest } = props
  const locale = useLocale()

  // Length of the text typed in an uncontrolled textarea, which React does not tell
  const [typedLength, setTypedLength] = useState<number>(null)

  const valueLength = typeof props.value === 'string' ? props.value.length : undefined
  const defaultValueLength = typeof props.defaultValue === 'string' ? props.defaultValue.length : 0
  const currentLength = valueLength ?? typedLength ?? defaultValueLength

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTypedLength(e.target.value.length)
    onChange && onChange(e)
  }

  // A single call, so the label and the error have the same ids the textarea points to
  const { getFormControlProps, getInputProps } = useFormControl(props)

  const inputProps = getInputProps({ describeError: true })
  const invalid = inputProps['aria-invalid']
  const errorId = inputProps['aria-errormessage']

  const { classes, css } = useStyles(createStyles, { invalid })
  const className = css(classes.input, invalid && classes.invalid, style, { resize })

  return (
    <FormControl {...getFormControlProps()} error={undefined}>
      <textarea
        className={className}
        {...inputProps}
        {...rest}
        aria-describedby={inputProps['aria-describedby']}
        onChange={handleChange}
      />

      <div className={classes.footer}>
        {error && (
          <FormError id={errorId} role='alert'>
            {error}
          </FormError>
        )}

        {props.maxLength && (
          <div className={classes.counter}>
            {currentLength}/{props.maxLength} {locale.textArea.characters}
          </div>
        )}
      </div>
    </FormControl>
  )
}

const createStyles = (theme: Theme, { invalid }) => ({
  ...createTextInputBaseStyles(theme),
  footer: {
    display: 'flex',
  },
  counter: {
    marginLeft: 'auto',
    color: invalid && theme.pallete.status.danger.main,
  } as CSSProperties,
})
