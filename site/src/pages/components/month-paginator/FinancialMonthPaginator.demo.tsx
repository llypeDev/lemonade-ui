import { FormControl, MonthPaginator } from '@lemonade/ui'
import React from 'react'

function FinancialMonthPaginator() {
  return (
    <FormControl label='Profits month' required>
      <MonthPaginator year={new Date().getFullYear()} />
    </FormControl>
  )
}

export default FinancialMonthPaginator
