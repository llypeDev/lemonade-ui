import React from 'react'

import { useFormControl, UseFormControlProps } from '../../hooks/useFormControl'
import { FormControl } from '../FormControl'

import { TextInput, TextInputProps } from './TextInput'

export interface TextFieldProps extends TextInputProps, UseFormControlProps {}

export function TextField(props: TextFieldProps) {
  const { label, error, inline, ...rest } = props

  const { getFormControlProps, getInputProps } = useFormControl(props)
  const inputProps = getInputProps({ describeError: true })

  return (
    <FormControl {...getFormControlProps()}>
      <TextInput
        invalid={inputProps['aria-invalid']}
        {...inputProps}
        {...rest}
        aria-describedby={inputProps['aria-describedby']}
      />
    </FormControl>
  )
}
