import React from 'react'

import { useLocale } from '../../i18n'
import { getUserLocale } from '../../util/locale'
import { Button } from '../Button'
import { HFlow } from '../HFlow'
import { Icon } from '../Icon'

export interface YearControlProps {
  visibleDate: Date
  onChange(newDate: Date): void
  renderYear?(date: Date): React.ReactNode
}

export function YearControl(props: YearControlProps) {
  const { visibleDate, onChange, renderYear } = props
  const locale = useLocale()

  // Goes to the first day: from February 29, setFullYear would roll over to March
  const handleNext = () => onChange(new Date(visibleDate.getFullYear() + 1, visibleDate.getMonth(), 1))

  const handlePrev = () => onChange(new Date(visibleDate.getFullYear() - 1, visibleDate.getMonth(), 1))

  return (
    <HFlow alignItems='center' hSpacing={0.5}>
      <Button title={locale.calendar.previousYear} size='small' skin='ghost' onClick={handlePrev} tabIndex={-1}>
        <Icon icon='angleLeft' />
      </Button>
      {renderYear(visibleDate)}
      <Button title={locale.calendar.nextYear} size='small' skin='ghost' onClick={handleNext} tabIndex={-1}>
        <Icon icon='angleRight' />
      </Button>
    </HFlow>
  )
}

YearControl.defaultProps = {
  renderYear: (date) => {
    const formatter = new Intl.DateTimeFormat(getUserLocale(), { year: 'numeric' })
    return formatter.format(date)
  },
} as Partial<YearControlProps>
