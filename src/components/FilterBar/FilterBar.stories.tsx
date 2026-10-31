import React, { useState } from 'react'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Flow } from '../Flow'
import { Radio } from '../Radio'

import { FilterBar, FilterBarChip } from './FilterBar'

export default {
  title: 'Components/FilterBar',
  component: FilterBar,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '16rem' }}>
        <Story />
      </div>
    ),
  ],
}

const statuses = ['Placed', 'Paid', 'Shipped', 'Delivered']
const periods = ['Today', 'Last 7 days', 'Last 30 days']

export const Default = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string[]>(['Paid'])
  const [period, setPeriod] = useState('Last 7 days')

  const active: FilterBarChip[] = [
    ...status.map((value) => ({ id: `status-${value}`, label: `Status: ${value}` })),
    ...(period ? [{ id: 'period', label: `Date: ${period}` }] : []),
  ]

  const remove = (id: string) => {
    if (id === 'period') {
      setPeriod('')
    } else {
      setStatus(status.filter((value) => `status-${value}` !== id))
    }
  }

  return (
    <FilterBar
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder='Search by number or customer'
      filters={[
        {
          id: 'status',
          label: 'Status',
          count: status.length,
          content: (
            <Flow direction='vertical' gap={0.5}>
              {statuses.map((value) => (
                <Checkbox
                  key={value}
                  label={value}
                  checked={status.includes(value)}
                  onChange={() =>
                    setStatus(status.includes(value) ? status.filter((item) => item !== value) : [...status, value])
                  }
                />
              ))}
            </Flow>
          ),
        },
        {
          id: 'date',
          label: 'Date',
          count: period ? 1 : 0,
          content: (
            <Flow direction='vertical' gap={0.5}>
              {periods.map((value) => (
                <Radio
                  key={value}
                  name='period'
                  label={value}
                  checked={period === value}
                  onChange={() => setPeriod(value)}
                />
              ))}
            </Flow>
          ),
        },
      ]}
      activeFilters={active}
      onRemoveFilter={remove}
      onClearFilters={() => {
        setStatus([])
        setPeriod('')
      }}
      resultCount={search ? 3 : 18 * (status.length || 3)}
      actions={
        <Button size='small' skin='ghost'>
          Export
        </Button>
      }
    />
  )
}
