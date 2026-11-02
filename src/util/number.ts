import { getUserLocale } from './locale'

/**
 * Formats a numeric value to its number format representation and current locale, using Intl.NumberFormat.
 *
 * @param value Value to be formatted
 * @param options Number format options
 * @return The formatted value.
 */
export function format(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(getUserLocale(), {
    style: 'decimal',
    ...options,
  }).format(value)
}

/**
 * Formats a numeric value to its local number format representation, using two digits when it is decimal and zero when it is integer
 * @param value Value to be formatted
 * @returns The formatted value
 */
export const formatDecimalOrInteger = (value: number): string => {
  const isDecimal = value % 1 !== 0

  const formatOptions: Intl.NumberFormatOptions = isDecimal
    ? {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    : {
        maximumFractionDigits: 0,
      }

  return format(value, formatOptions)
}

const ABBREV_UNITS: [number, string][] = [
  [1, ''],
  [1e3, 'k'],
  [1e6, 'm'],
  [1e9, 'b'],
  [1e12, 't'],
]

/**
 * Abrreviates a number to its compact representation.
 * Example: 1000000 is abbreviated to '1m'
 *
 * @param value Value to be abbreviated.
 * @param options?: Intl.NumberFormatOptions
 * @return The abbreviated value.
 */
export function abbrev(value: number, options?: Intl.NumberFormatOptions) {
  if (typeof value !== 'number' || isNaN(value)) {
    return value
  }

  const formatOptions: Intl.NumberFormatOptions = { minimumFractionDigits: 0, maximumFractionDigits: 1, ...options }
  const fractionDigits = formatOptions.maximumFractionDigits ?? 1

  // The next unit is taken while the rounded value reaches a thousand, so 999999 is "1m" and not "1,000k"
  let unit = 0
  while (unit < ABBREV_UNITS.length - 1 && Math.abs(+(value / ABBREV_UNITS[unit][0]).toFixed(fractionDigits)) >= 1e3) {
    unit++
  }

  const [size, suffix] = ABBREV_UNITS[unit]
  return format(value / size, formatOptions) + suffix
}
