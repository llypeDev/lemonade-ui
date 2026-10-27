import { Button, TextInput, Theme, Tooltip, useStyles } from '@lemonade/ui'
import { PhArrowCounterClockwise } from '@lemonade/ui/phosphor/generated/PhArrowCounterClockwise'
import { PhCheckCircle } from '@lemonade/ui/phosphor/generated/PhCheckCircle'
import { PhDiceFive } from '@lemonade/ui/phosphor/generated/PhDiceFive'
import { PhLink } from '@lemonade/ui/phosphor/generated/PhLink'
import { useIntl } from 'gatsby-plugin-intl'
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  CATEGORIES,
  ICONS,
  ICONS_BY_NAME,
  loadWeight,
  PHOSPHOR_VERSION,
  PhosphorEntry,
  WEIGHTS,
  WeightShapes,
} from './data'
import { copyText } from './exporters'
import { PhosphorGrid } from './PhosphorGrid'
import { PhosphorPanel } from './PhosphorPanel'
import { searchIcons } from './search'
import { MAX_SIZE, MIN_SIZE, settingsToSearch, useExplorerState } from './useExplorerState'

const categoryKey = (category: string) => `phosphor-category-${category.replace(/[^a-z]+/g, '-')}`

/** Relative luminance of a hex color (0 = black, 1 = white). */
function luminance(hex: string) {
  const value = hex.replace('#', '')
  const full =
    value.length <= 4
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
          .slice(0, 6)
      : value.slice(0, 6)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(full.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Interactive Phosphor icon explorer: search, weights, size, color, deep links, copy and download.
 * Data comes from `yarn phosphor:site-data` (catalog bundled, SVG shapes fetched per weight on demand).
 */
export function PhosphorExplorer() {
  const intl = useIntl()
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values)
  const { settings, ready, update, reset, randomize } = useExplorerState()
  const { query, weight, size, color, category, selected } = settings

  const [shapes, setShapes] = useState<WeightShapes | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const inverted = !!color && luminance(color) > 0.6
  const { classes, css, theme } = useStyles(createStyles, !!selected)
  const exportColor = color || theme.pallete.text.main

  // Load the SVG shapes of the selected weight (cached per weight).
  useEffect(() => {
    if (!ready) return
    let active = true
    setLoadError(false)
    loadWeight(weight)
      .then((data) => active && setShapes(data))
      .catch(() => active && setLoadError(true))
    return () => {
      active = false
    }
  }, [ready, weight, attempt])

  const results = useMemo(() => searchIcons(ICONS, query, category), [query, category])
  const selectedEntry = selected ? ICONS_BY_NAME[selected] : undefined

  const announce = useCallback((message: string) => {
    setAnnouncement('')
    // Re-set on the next tick so screen readers announce repeated messages.
    setTimeout(() => setAnnouncement(message), 50)
  }, [])

  const closePanel = useCallback(() => {
    if (!selected) return
    const button = document.querySelector<HTMLButtonElement>(`button[data-icon="${selected}"]`)
    update({ selected: '' })
    if (button) button.focus()
  }, [selected, update])

  // Keyboard shortcuts: "/" focuses the search, Escape closes the details panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        if (searchRef.current) searchRef.current.focus()
      } else if (event.key === 'Escape' && selected) {
        closePanel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected, closePanel])

  useEffect(() => {
    if (!linkCopied) return
    const timer = setTimeout(() => setLinkCopied(false), 1800)
    return () => clearTimeout(timer)
  }, [linkCopied])

  const copyLink = async () => {
    try {
      await copyText(`${window.location.origin}${window.location.pathname}${settingsToSearch(settings)}`)
      setLinkCopied(true)
      announce(t('phosphor-link-copied'))
    } catch {
      announce(t('phosphor-copy-failed'))
    }
  }

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => update({ query: event.target.value })

  const searchTag = (tag: string) => {
    const isCategory = CATEGORIES.some((item) => item.name === tag)
    update(isCategory ? { category: tag, query: '' } : { query: tag, category: '' })
    if (searchRef.current) searchRef.current.focus()
  }

  return (
    <section className={classes.explorer} aria-label={t('phosphor-explorer-label')}>
      <div className={classes.toolbar}>
        <div className={classes.searchRow}>
          <div className={classes.search}>
            <TextInput
              inputRef={searchRef}
              icon='zoomOutline'
              iconPosition='left'
              aria-label={t('phosphor-search-label')}
              placeholder={t('phosphor-search-placeholder', { count: ICONS.length.toLocaleString(intl.locale) })}
              value={query}
              onChange={onSearchChange}
              onClear={() => update({ query: '' })}
            />
          </div>
          <label className={classes.field}>
            <span className={classes.fieldLabel}>{t('phosphor-category')}</span>
            <select
              className={classes.select}
              value={category}
              onChange={(event) => update({ category: event.target.value })}
            >
              <option value=''>{t('phosphor-all-categories')}</option>
              {CATEGORIES.map((item) => (
                <option key={item.name} value={item.name}>
                  {t(categoryKey(item.name))} ({item.count})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={classes.controls}>
          <div className={classes.field} role='radiogroup' aria-label={t('phosphor-weight')}>
            <span className={classes.fieldLabel} aria-hidden='true'>
              {t('phosphor-weight')}
            </span>
            <div className={classes.segmented}>
              {WEIGHTS.map((item) => (
                <button
                  key={item}
                  type='button'
                  role='radio'
                  aria-checked={weight === item}
                  className={css(classes.segment, weight === item && classes.segmentActive)}
                  onClick={() => update({ weight: item })}
                >
                  {t(`phosphor-weight-${item}`)}
                </button>
              ))}
            </div>
          </div>

          <label className={classes.field}>
            <span className={classes.fieldLabel}>
              {t('phosphor-size')} <strong>{size}px</strong>
            </span>
            <input
              className={classes.range}
              type='range'
              min={MIN_SIZE}
              max={MAX_SIZE}
              step={4}
              value={size}
              onChange={(event) => update({ size: Number(event.target.value) })}
            />
          </label>

          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('phosphor-color')}</span>
            <div className={classes.colorRow}>
              <input
                className={classes.colorInput}
                type='color'
                aria-label={t('phosphor-color')}
                value={color || (theme.pallete.text.main.length === 7 ? theme.pallete.text.main : '#24252e')}
                onChange={(event) => update({ color: event.target.value })}
              />
              <code className={classes.colorValue}>{color || t('phosphor-color-auto')}</code>
              {color && (
                <Button size='small' skin='ghost' onClick={() => update({ color: '' })}>
                  {t('phosphor-color-auto')}
                </Button>
              )}
            </div>
          </div>

          <div className={classes.toolActions}>
            <Tooltip text={t('phosphor-reset')}>
              <Button size='small' skin='ghost' aria-label={t('phosphor-reset')} onClick={reset}>
                <PhArrowCounterClockwise size={20} />
              </Button>
            </Tooltip>
            <Tooltip text={t('phosphor-random')}>
              <Button size='small' skin='ghost' aria-label={t('phosphor-random')} onClick={randomize}>
                <PhDiceFive size={20} />
              </Button>
            </Tooltip>
            <Tooltip text={t('phosphor-copy-link')}>
              <Button size='small' skin='ghost' aria-label={t('phosphor-copy-link')} onClick={copyLink}>
                {linkCopied ? (
                  <PhCheckCircle size={20} weight='fill' color={theme.pallete.status.success.main} />
                ) : (
                  <PhLink size={20} />
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <p className={classes.summary}>
        {t('phosphor-results', { count: results.length.toLocaleString(intl.locale) })}
        <span className={classes.hint}> · {t('phosphor-shortcuts')}</span>
        <span className={classes.hint}> · Phosphor v{PHOSPHOR_VERSION}</span>
      </p>

      {loadError ? (
        <div className={classes.message}>
          <p>{t('phosphor-load-error')}</p>
          <Button size='small' onClick={() => setAttempt((value) => value + 1)}>
            {t('phosphor-retry')}
          </Button>
        </div>
      ) : !ready || !shapes ? (
        <p className={classes.message}>{t('phosphor-loading')}</p>
      ) : results.length === 0 ? (
        <p className={classes.message}>{t('phosphor-no-results', { query })}</p>
      ) : (
        <PhosphorGrid
          icons={results}
          shapes={shapes}
          size={size}
          color={color || 'currentColor'}
          inverted={inverted}
          selected={selected}
          onSelect={(entry: PhosphorEntry) => update({ selected: entry.name === selected ? '' : entry.name })}
        />
      )}

      {selectedEntry && (
        <PhosphorPanel
          entry={selectedEntry}
          shapes={shapes ? shapes[selectedEntry.name] : undefined}
          weight={weight}
          size={size}
          color={color}
          exportColor={exportColor}
          inverted={inverted}
          onClose={closePanel}
          onSearchTag={searchTag}
          onAnnounce={announce}
        />
      )}

      <div className={classes.srOnly} aria-live='polite' role='status'>
        {announcement}
      </div>
    </section>
  )
}

const createStyles = (theme: Theme, panelOpen: boolean) => ({
  explorer: {
    marginBottom: '2rem',
    paddingBottom: panelOpen ? '22rem' : 0,
  } as CSSProperties,
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    marginBottom: '1rem',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    background: theme.pallete.surface.main,
  } as CSSProperties,
  searchRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-end',
  } as CSSProperties,
  search: {
    flex: '1 1 320px',
    minWidth: 0,
  } as CSSProperties,
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem 1.5rem',
    alignItems: 'flex-end',
  } as CSSProperties,
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    margin: 0,
  } as CSSProperties,
  fieldLabel: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  select: {
    height: '2rem',
    padding: '0 0.5rem',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: theme.radius.input,
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.sizes.text,
    '&:focus': { outline: 'none', boxShadow: `0 0 0 2px ${theme.pallete.primary.main}` },
  } as CSSProperties,
  segmented: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: theme.radius.button,
    overflow: 'hidden',
  } as CSSProperties,
  segment: {
    padding: '0.375rem 0.75rem',
    border: 'none',
    borderRight: `1px solid ${theme.pallete.divider}`,
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: '0.8125rem',
    cursor: 'pointer',
    '&:last-of-type': { borderRight: 'none' },
    '&:hover': { background: theme.pallete.surface.background },
    '&:focus': { outline: 'none', boxShadow: `inset 0 0 0 2px ${theme.pallete.primary.main}` },
  } as CSSProperties,
  segmentActive: {
    background: `${theme.pallete.primary.main} !important`,
    color: theme.pallete.surface.main,
    fontWeight: 'bold',
  } as CSSProperties,
  range: {
    width: 180,
    accentColor: theme.pallete.primary.main,
  } as CSSProperties,
  colorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as CSSProperties,
  colorInput: {
    width: 36,
    height: 28,
    padding: 0,
    border: `1px solid ${theme.pallete.gray.c60}`,
    borderRadius: theme.radius.input,
    background: 'transparent',
    cursor: 'pointer',
  } as CSSProperties,
  colorValue: {
    fontSize: '0.8125rem',
    minWidth: '4.5rem',
  } as CSSProperties,
  toolActions: {
    display: 'flex',
    gap: '0.25rem',
    marginLeft: 'auto',
  } as CSSProperties,
  summary: {
    margin: '0 0 1rem 0',
    fontSize: '0.8125rem',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  hint: {
    [theme.breakpoints.down('sm')]: { display: 'none' },
  } as CSSProperties,
  message: {
    padding: '3rem 1rem',
    textAlign: 'center',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  } as CSSProperties,
})
