import React, { CSSProperties, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { TextInput } from '../TextField/TextInput'

export interface FilterBarFilter {
  /**
   * Unique id of the filter
   */
  id: string

  /**
   * Text of the button, such as "Status"
   */
  label: string

  /**
   * Controls of the filter, shown in a popover, such as checkboxes
   */
  content: React.ReactNode

  /**
   * Number of values picked in the filter, shown on its button
   */
  count?: number
}

export interface FilterBarChip {
  /**
   * Id passed to `onRemoveFilter`
   */
  id: string

  /**
   * Text of the active filter, such as "Status: Paid"
   */
  label: string
}

export interface FilterBarProps {
  /**
   * Text of the search field. With `onSearchChange`, the bar shows a search field.
   */
  search?: string

  onSearchChange?(value: string): void

  searchPlaceholder?: string

  filters?: FilterBarFilter[]

  /**
   * The filters in use, shown as tags that the user can remove
   */
  activeFilters?: FilterBarChip[]

  onRemoveFilter?(id: string): void

  /**
   * Shows a button that removes all the filters
   */
  onClearFilters?(): void

  /**
   * Number of results with the current filters, announced to screen readers when it changes
   */
  resultCount?: number

  /**
   * Content at the end of the bar, such as an export button
   */
  actions?: React.ReactNode

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

function FilterButton(props: { filter: FilterBarFilter }) {
  const { filter } = props
  const { classes, css } = useStyles(createStyles)
  const [anchor, setAnchor] = useState<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button innerRef={setAnchor} size='small' skin='outline' onClick={() => setOpen(!open)}>
        <span className={classes.buttonLabel}>
          {filter.label}
          {!!filter.count && <span className={classes.count}>{filter.count}</span>}
          <Icon icon='angleDown' size={1} style={css(classes.chevron, open && classes.open)} />
        </span>
      </Button>
      <Popover anchorRef={anchor} open={open} onClose={() => setOpen(false)} aria-label={filter.label}>
        {filter.content}
      </Popover>
    </>
  )
}

/**
 * The search, the filters and the active filters of a list or a table, with the number of results. Each filter
 * opens its controls in a popover, and each active filter shows as a tag that can be removed.
 */
export function FilterBar(props: FilterBarProps) {
  const {
    search,
    onSearchChange,
    searchPlaceholder,
    filters = [],
    activeFilters = [],
    onRemoveFilter,
    onClearFilters,
    resultCount,
    actions,
    style,
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)

  const results =
    resultCount === undefined
      ? ''
      : resultCount === 1
      ? locale.filterBar.resultsOne
      : fill(locale.filterBar.resultsOther, { count: resultCount })

  return (
    <div className={css(classes.root, style)}>
      <div className={classes.row}>
        {onSearchChange && (
          <div role='search' className={classes.search}>
            <TextInput
              icon='zoomOutline'
              aria-label={locale.filterBar.search}
              placeholder={searchPlaceholder}
              value={search ?? ''}
              clearable
              onChange={(e) => onSearchChange(e ? e.target.value : '')}
              onClear={() => onSearchChange('')}
            />
          </div>
        )}
        {filters.map((filter) => (
          <FilterButton key={filter.id} filter={filter} />
        ))}
        <span className={classes.spacer} />
        <span role='status' className={classes.results}>
          {results}
        </span>
        {actions}
      </div>

      {activeFilters.length > 0 && (
        <div role='group' aria-label={locale.filterBar.active} className={classes.active}>
          {activeFilters.map((chip) => (
            <span key={chip.id} className={classes.chip}>
              {chip.label}
              {onRemoveFilter && (
                <button
                  type='button'
                  className={classes.remove}
                  aria-label={fill(locale.filterBar.remove, { filter: chip.label })}
                  title={fill(locale.filterBar.remove, { filter: chip.label })}
                  onClick={() => onRemoveFilter(chip.id)}
                >
                  <Icon icon='timesDefault' size={1} />
                </button>
              )}
            </span>
          ))}
          {onClearFilters && (
            <Button size='small' skin='ghost' onClick={onClearFilters}>
              {locale.filterBar.clear}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as CSSProperties,
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,
  search: {
    flex: '1 1 14rem',
    maxWidth: '22rem',
  } as CSSProperties,
  spacer: {
    flex: 1,
  } as CSSProperties,
  results: {
    color: theme.pallete.text.secondary,
    whiteSpace: 'nowrap',
  } as CSSProperties,
  buttonLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
  } as CSSProperties,
  count: {
    minWidth: '1.125rem',
    padding: '0 0.25rem',
    boxSizing: 'border-box',
    borderRadius: '0.5625rem',
    background: theme.pallete.primary.main,
    color: theme.pallete.surface.main,
    fontSize: '0.75rem',
    lineHeight: '1.125rem',
    textAlign: 'center',
  } as CSSProperties,
  chevron: {
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  open: {
    transform: 'rotate(180deg)',
  } as CSSProperties,
  active: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    minHeight: '1.75rem',
    boxSizing: 'border-box',
    padding: '0 0.25rem 0 0.75rem',
    border: `1px solid ${theme.pallete.primary.c80}`,
    borderRadius: '0.875rem',
    background: theme.pallete.primary.c90,
    color: theme.pallete.primary.c30,
    fontWeight: 'bold',
  } as CSSProperties,
  remove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.375rem',
    height: '1.375rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: '50%',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      background: theme.pallete.primary.c80,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
})
