import React, { useLayoutEffect, useRef, useState } from 'react'

import { Omit } from '../../util'
import { composeRefs } from '../../util/react'
import { TextField, TextFieldProps } from '../TextField'

export interface CurrencyFieldProps
  extends Omit<TextFieldProps, 'value' | 'defaultValue' | 'onChange' | 'type' | 'clearable' | 'onClear'> {
  /**
   * The amount, for a controlled field, such as `1234.56`. `null` leaves the field empty.
   */
  value?: number | null

  /**
   * Amount an uncontrolled field starts with
   * @default null
   */
  defaultValue?: number | null

  /**
   * Called with the amount as a number, or `null` when the field is cleared
   */
  onChange?(value: number | null): void

  /**
   * Symbol before the amount
   * @default 'R$'
   */
  currency?: string

  /**
   * @default ','
   */
  decimalSeparator?: string

  /**
   * @default '.'
   */
  thousandsSeparator?: string

  /**
   * Number of decimal places
   * @default 2
   */
  decimals?: number

  /**
   * Lets the amount be negative: the `-` key turns it negative and the `+` key turns it positive
   * @default false
   */
  allowNegative?: boolean

  /**
   * Smallest amount; a smaller one becomes this one when the field loses the focus
   */
  min?: number

  /**
   * Largest amount; a larger one becomes this one when the field loses the focus
   */
  max?: number
}

// Enough digits for amounts in the trillions, without losing precision
const maxDigits = 15

export interface CurrencyFormat {
  currency: string
  decimalSeparator: string
  thousandsSeparator: string
  decimals: number
}

/**
 * Writes an amount as the field shows it, such as `R$ 1.234,56`
 */
export const formatCurrency = (value: number, format: CurrencyFormat) => {
  const { currency, decimalSeparator, thousandsSeparator, decimals } = format
  const scale = Math.pow(10, decimals)
  const units = Math.round(Math.abs(value) * scale)
  const integer = Math.floor(units / scale)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  const fraction = decimals > 0 ? decimalSeparator + String(units % scale).padStart(decimals, '0') : ''
  const sign = value < 0 && units > 0 ? '-' : ''
  return `${sign}${currency ? currency + ' ' : ''}${integer}${fraction}`
}

/**
 * Field for an amount of money. The digits fill the amount from the cents, as in banking apps: typing 1, 2, 3, 4
 * shows R$ 12,34. The value is a number, such as `12.34`.
 */
export function CurrencyField(props: CurrencyFieldProps) {
  const {
    value,
    defaultValue = null,
    onChange,
    currency = 'R$',
    decimalSeparator = ',',
    thousandsSeparator = '.',
    decimals = 2,
    allowNegative = false,
    min,
    max,
    placeholder,
    inputRef,
    onKeyDown,
    onBlur,
    ...rest
  } = props

  const format: CurrencyFormat = { currency, decimalSeparator, thousandsSeparator, decimals }
  const scale = Math.pow(10, decimals)
  const ref = useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue)
  const current = value !== undefined ? value : internalValue
  const text = current === null || current === undefined || isNaN(current) ? '' : formatCurrency(current, format)

  const update = (next: number | null) => {
    if (next === current) {
      return
    }
    if (value === undefined) {
      setInternalValue(next)
    }
    onChange && onChange(next)
  }

  // The amount grows from the right, so the caret stays at the end
  useLayoutEffect(() => {
    const input = ref.current
    if (input && document.activeElement === input) {
      input.setSelectionRange(input.value.length, input.value.length)
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigits)
    if (!digits) {
      update(null)
      return
    }
    const amount = parseInt(digits, 10) / scale
    const negative = allowNegative && current !== null && current < 0
    update(negative ? -amount : amount)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown && onKeyDown(e)
    if (e.defaultPrevented) {
      return
    }
    if (e.key === '-' || e.key === '+') {
      e.preventDefault()
      if (allowNegative && current) {
        update(e.key === '-' ? -Math.abs(current) : Math.abs(current))
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur && onBlur(e)
    if (current === null || current === undefined) {
      return
    }
    if (min !== undefined && current < min) {
      update(min)
    } else if (max !== undefined && current > max) {
      update(max)
    }
  }

  return (
    <TextField
      {...rest}
      inputRef={composeRefs(ref, inputRef) as any}
      type='text'
      inputMode='decimal'
      autoComplete='off'
      value={text}
      placeholder={placeholder ?? formatCurrency(0, format)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  )
}
