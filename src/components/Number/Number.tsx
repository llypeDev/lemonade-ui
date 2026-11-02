import React from 'react'

import * as numberUtil from '../../util/number'

export interface NumberProps {
  value: number
  placeholder?: string
  title?: string
  abbrev?: boolean
  prefix?: string
  suffix?: string
  formatOptions?: Intl.NumberFormatOptions
}

export function Number(props: NumberProps) {
  const { value, placeholder, title, abbrev, prefix, suffix, formatOptions } = props

  const hasValue = typeof value === 'number' && !isNaN(value)

  const renderTitle = () => {
    return title || (abbrev && hasValue ? numberUtil.format(value, formatOptions) : undefined)
  }

  const renderNumber = () => {
    if (!hasValue) {
      return placeholder
    }

    const num = abbrev ? numberUtil.abbrev(value, formatOptions) : numberUtil.format(value, formatOptions)

    return prefix + num + suffix
  }

  return <span title={renderTitle()}>{renderNumber()}</span>
}

Number.defaultProps = {
  placeholder: '',
  prefix: '',
  suffix: '',
} as Partial<NumberProps>
