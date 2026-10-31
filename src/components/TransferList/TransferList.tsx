import React, { CSSProperties, useMemo, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Icon } from '../Icon'
import { TextInput } from '../TextField/TextInput'
import { VisuallyHidden } from '../VisuallyHidden'

export interface TransferListItem {
  id: string
  label: string

  /**
   * Second line, such as an email or a description
   */
  description?: string

  /**
   * The item stays where it is
   */
  disabled?: boolean
}

export interface TransferListProps {
  /**
   * All the items, in the order they show in both lists
   */
  items: TransferListItem[]

  /**
   * Ids of the items in the second list, for a controlled component
   */
  value?: string[]

  /**
   * Ids of the items an uncontrolled component starts with in the second list
   * @default []
   */
  defaultValue?: string[]

  /**
   * Called with the ids of the items in the second list after the user moves items
   */
  onChange?(value: string[]): void

  /**
   * Title of the first list
   * @default "Available", from the locale strings
   */
  sourceLabel?: string

  /**
   * Title of the second list
   * @default "Selected", from the locale strings
   */
  targetLabel?: string

  /**
   * Shows a search field above each list
   * @default true
   */
  searchable?: boolean

  /**
   * Height of each list, which scrolls when the items do not fit
   * @default '15rem'
   */
  listHeight?: string

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

// Searches ignore case and accents
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

type Side = 'source' | 'target'

/**
 * Two lists side by side, and buttons that move the checked items from one to the other, such as the
 * permissions of a role or the columns shown in a report.
 */
export function TransferList(props: TransferListProps) {
  const {
    items,
    value,
    defaultValue = [],
    onChange,
    sourceLabel,
    targetLabel,
    searchable = true,
    listHeight = '15rem',
    style,
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const baseId = useMemo(() => `transfer-list-${randomStr()}`, [])

  const [internalValue, setInternalValue] = useState(defaultValue)
  const [checked, setChecked] = useState<Record<Side, string[]>>({ source: [], target: [] })
  const [search, setSearch] = useState<Record<Side, string>>({ source: '', target: '' })
  const [announcement, setAnnouncement] = useState('')

  const targetIds = value ?? internalValue
  const labels: Record<Side, string> = {
    source: sourceLabel ?? locale.transferList.available,
    target: targetLabel ?? locale.transferList.selected,
  }

  const itemsOf = (side: Side) => items.filter((item) => (side === 'target') === targetIds.includes(item.id))

  const visibleOf = (side: Side) => {
    const query = normalize(search[side].trim())
    return itemsOf(side).filter(
      (item) => !query || normalize(`${item.label} ${item.description || ''}`).includes(query)
    )
  }

  const movableOf = (side: Side) => visibleOf(side).filter((item) => !item.disabled)

  const move = (from: Side, ids: string[]) => {
    if (ids.length === 0) {
      return
    }
    const to: Side = from === 'source' ? 'target' : 'source'
    const next =
      to === 'target'
        ? items.filter((item) => targetIds.includes(item.id) || ids.includes(item.id)).map((item) => item.id)
        : targetIds.filter((id) => !ids.includes(id))

    if (value === undefined) {
      setInternalValue(next)
    }
    onChange && onChange(next)
    setChecked({ ...checked, [from]: checked[from].filter((id) => !ids.includes(id)) })
    setAnnouncement(fill(locale.transferList.moved, { count: ids.length, list: labels[to] }))
  }

  const moveChecked = (from: Side) =>
    move(
      from,
      movableOf(from)
        .filter((item) => checked[from].includes(item.id))
        .map((item) => item.id)
    )

  const moveAll = (from: Side) =>
    move(
      from,
      movableOf(from).map((item) => item.id)
    )

  const toggle = (side: Side, id: string) =>
    setChecked({
      ...checked,
      [side]: checked[side].includes(id) ? checked[side].filter((other) => other !== id) : [...checked[side], id],
    })

  const renderPanel = (side: Side) => {
    const visible = visibleOf(side)
    const movable = movableOf(side)
    const checkedVisible = movable.filter((item) => checked[side].includes(item.id))
    const allChecked = movable.length > 0 && checkedVisible.length === movable.length
    const titleId = `${baseId}-${side}`

    const toggleAll = () =>
      setChecked({
        ...checked,
        [side]: allChecked
          ? checked[side].filter((id) => !movable.some((item) => item.id === id))
          : [...checked[side], ...movable.map((item) => item.id).filter((id) => !checked[side].includes(id))],
      })

    return (
      <section className={classes.panel} aria-labelledby={titleId}>
        <div className={classes.header}>
          <Checkbox
            aria-label={fill(locale.transferList.selectAll, { list: labels[side] })}
            checked={allChecked}
            indeterminate={checkedVisible.length > 0 && !allChecked}
            disabled={movable.length === 0}
            onChange={toggleAll}
          />
          <span id={titleId} className={classes.title}>
            {labels[side]}
          </span>
          <span className={classes.count}>
            {fill(locale.transferList.count, { checked: checked[side].length, total: itemsOf(side).length })}
          </span>
        </div>
        {searchable && (
          <div className={classes.search}>
            <TextInput
              icon='zoomOutline'
              aria-label={fill(locale.transferList.search, { list: labels[side] })}
              value={search[side]}
              clearable
              onChange={(e) => setSearch({ ...search, [side]: e ? e.target.value : '' })}
              onClear={() => setSearch({ ...search, [side]: '' })}
            />
          </div>
        )}
        <ul className={classes.list} style={{ height: listHeight }} aria-labelledby={titleId}>
          {visible.map((item) => (
            <li key={item.id} className={classes.item}>
              <Checkbox
                checked={checked[side].includes(item.id)}
                disabled={item.disabled}
                onChange={() => toggle(side, item.id)}
                label={
                  <span className={classes.label}>
                    <span>{item.label}</span>
                    {item.description && <span className={classes.description}>{item.description}</span>}
                  </span>
                }
              />
            </li>
          ))}
          {visible.length === 0 && (
            <li className={classes.empty}>
              {search[side].trim() ? locale.transferList.noResults : locale.transferList.empty}
            </li>
          )}
        </ul>
      </section>
    )
  }

  const moveButton = (from: Side, all: boolean) => {
    const to: Side = from === 'source' ? 'target' : 'source'
    const text = fill(all ? locale.transferList.moveAll : locale.transferList.moveSelected, { list: labels[to] })
    const disabled = all
      ? movableOf(from).length === 0
      : !movableOf(from).some((item) => checked[from].includes(item.id))
    const icon = from === 'source' ? (all ? 'angleDoubleRight' : 'angleRight') : all ? 'angleDoubleLeft' : 'angleLeft'

    return (
      <Button
        size='small'
        aria-label={text}
        title={text}
        disabled={disabled}
        onClick={() => (all ? moveAll(from) : moveChecked(from))}
      >
        <Icon icon={icon} style={classes.arrow} />
      </Button>
    )
  }

  return (
    <div className={css(classes.root, style)}>
      {renderPanel('source')}
      <div className={classes.buttons}>
        {moveButton('source', false)}
        {moveButton('source', true)}
        {moveButton('target', false)}
        {moveButton('target', true)}
      </div>
      {renderPanel('target')}
      <VisuallyHidden role='status'>{announcement}</VisuallyHidden>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  } as CSSProperties,
  panel: {
    flex: 1,
    minWidth: 0,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    background: theme.pallete.surface.main,
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderBottom: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  title: {
    flex: 1,
    fontWeight: 'bold',
  } as CSSProperties,
  count: {
    color: theme.pallete.text.secondary,
    whiteSpace: 'nowrap',
  } as CSSProperties,
  search: {
    padding: '0.5rem 1rem 0',
  } as CSSProperties,
  list: {
    listStyle: 'none',
    margin: 0,
    padding: '0.5rem 0',
    overflowY: 'auto',
  } as CSSProperties,
  item: {
    padding: '0.25rem 1rem',
    '& label': {
      alignItems: 'flex-start',
    },
  } as CSSProperties,
  label: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '0.125rem',
  } as CSSProperties,
  description: {
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  empty: {
    padding: '0.5rem 1rem',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
  } as CSSProperties,
  arrow: {
    // The lists are one above the other on small screens, so the arrows point down and up
    [theme.breakpoints.down('sm')]: {
      transform: 'rotate(90deg)',
    },
  } as CSSProperties,
})
