import { useRef } from 'react'

import { randomStr } from '../util/string'

export interface UseFormControlProps {
  id?: string
  required?: boolean
  label?: React.ReactNode
  error?: React.ReactNode
  inline?: boolean
  'aria-describedby'?: string
}

export interface FormControlInputOptions {
  /**
   * Adds the error id to the `aria-describedby` of the field, after its own one, so screen readers that do not
   * support `aria-errormessage` read the error too. The input must take this `aria-describedby` over its own.
   */
  describeError?: boolean
}

export interface FormControlInputProps {
  'aria-labelledby': string
  'aria-invalid': boolean
  'aria-errormessage': string
  'aria-describedby'?: string
}

export function useFormControl(props: UseFormControlProps) {
  const { id, label, error, required, inline, 'aria-describedby': describedBy } = props

  const labelIdRef = useRef(`label-${randomStr()}`)
  const errorIdRef = useRef(`error-${randomStr()}`)

  const labelId = label && !id ? labelIdRef.current : undefined
  const errorId = error ? errorIdRef.current : undefined

  return {
    getFormControlProps: () => ({
      label,
      error,
      htmlFor: id,
      labelId,
      errorId,
      required,
      inline,
    }),
    getInputProps: (options: FormControlInputOptions = {}): FormControlInputProps => {
      const inputProps: FormControlInputProps = {
        'aria-labelledby': labelId,
        'aria-invalid': !!error ? true : undefined,
        'aria-errormessage': errorId,
      }

      if (options.describeError) {
        inputProps['aria-describedby'] = [describedBy, errorId].filter(Boolean).join(' ') || undefined
      }

      return inputProps
    },
  }
}
