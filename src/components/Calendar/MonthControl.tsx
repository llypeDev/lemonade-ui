import React from 'react'

import { useLocale } from '../../i18n'
import { getUserLocale } from '../../util/locale'
import { capitalize } from '../../util/string'
import { Button } from '../Button'
import { HFlow } from '../HFlow'
import { Icon } from '../Icon'

export interface MonthControlProps {
  visibleDate: Date
  onChange(newDate: Date): void
  renderMonth?(date: Date): React.ReactNode
}

export function MonthControl(props: MonthControlProps) {
  const { visibleDate, onChange, renderMonth } = props
  const locale = useLocale()

  // Goes to the first day: from a 31st, setMonth would roll over to the month after the target
  const handleNext = () => onChange(new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1))

  const handlePrev = () => onChange(new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1))

  return (
    <HFlow alignItems='center' hSpacing={0.5}>
      <Button title={locale.calendar.previousMonth} size='small' skin='ghost' onClick={handlePrev}>
        <Icon icon='angleLeft' />
      </Button>
      {renderMonth(visibleDate)}
      <Button title={locale.calendar.nextMonth} size='small' skin='ghost' onClick={handleNext}>
        <Icon icon='angleRight' />
      </Button>
    </HFlow>
  )
}

MonthControl.defaultProps = {
  renderMonth: (date) => {
    const formatter = new Intl.DateTimeFormat(getUserLocale(), { month: 'short' })
    return capitalize(formatter.format(date))
  },
} as Partial<MonthControlProps>
