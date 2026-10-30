import { keyframes } from 'emotion'
import FocusTrap from 'focus-trap-react'
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { zIndexLevel } from '../../styles/theme/zIndex'
import { randomStr } from '../../util/string'
import { Icon, IconImage } from '../Icon'
import { Kbd } from '../Kbd'
import { ModalBackdrop } from '../Modal/ModalBackdrop'
import { Portal } from '../Portal'

export interface CommandItem {
  /**
   * Unique id of the command
   */
  id: string

  label: string

  /**
   * Second line, such as where a page is
   */
  description?: string

  icon?: IconImage

  /**
   * Group the command shows under, such as "Pages" or "Actions"
   */
  group?: string

  /**
   * Keys of the shortcut of the command elsewhere in the app, such as `['Ctrl', 'N']`
   */
  shortcut?: string[]

  /**
   * Other words that find the command, such as synonyms
   */
  keywords?: string[]

  /**
   * Runs the command. The palette closes after it.
   */
  onSelect(): void
}

export interface CommandPaletteProps {
  open: boolean

  /**
   * Called to open or close the palette: by the shortcut, the `Escape` key, a click on the backdrop or a command
   */
  onOpenChange(open: boolean): void

  items: CommandItem[]

  /**
   * @default "Search pages and actions", from the locale strings
   */
  placeholder?: string

  /**
   * Text shown when no command matches the search
   * @default "No results found", from the locale strings
   */
  emptyText?: React.ReactNode

  /**
   * Opens and closes the palette with Ctrl + K, or ⌘ + K on Mac
   * @default true
   */
  hotkey?: boolean

  style?: ExternalStyles
}

// Lower case and without accents, so "acao" finds "Ação"
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const matches = (item: CommandItem, query: string) => {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  const text = normalize([item.label, item.description, item.group, ...(item.keywords ?? [])].filter(Boolean).join(' '))
  return words.every((word) => text.includes(word))
}

const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-0.5rem)' },
  to: { opacity: 1, transform: 'none' },
})

/**
 * Search box that finds pages and actions of the application and runs them, opened with Ctrl + K.
 */
export function CommandPalette(props: CommandPaletteProps) {
  const { open, onOpenChange, items, placeholder, emptyText, hotkey = true, style } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const baseId = useMemo(() => `command-palette-${randomStr()}`, [])

  const results = useMemo(() => items.filter((item) => matches(item, query)), [items, query])

  // Commands of the same group stay together, in the order the groups first appear
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    results.forEach((item) => {
      const group = item.group ?? ''
      map.set(group, [...(map.get(group) ?? []), item])
    })
    return Array.from(map.entries())
  }, [results])
  const ordered = useMemo(() => groups.reduce<CommandItem[]>((all, [, groupItems]) => all.concat(groupItems), []), [
    groups,
  ])

  const optionId = (item: CommandItem) => `${baseId}-${item.id.replace(/[^\w-]/g, '_')}`
  const active = ordered[Math.min(activeIndex, ordered.length - 1)]

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      // The search box gets the focus before the focus trap looks for a first element
      inputRef.current && inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (!hotkey) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hotkey, open, onOpenChange])

  // Keeps the active command in view as the arrow keys move through a long list
  useEffect(() => {
    if (open && active && listRef.current) {
      const element = listRef.current.querySelector<HTMLElement>(`#${optionId(active)}`)
      element && element.scrollIntoView && element.scrollIntoView({ block: 'nearest' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active])

  if (!open) {
    return null
  }

  const run = (item: CommandItem) => {
    onOpenChange(false)
    item.onSelect()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const last = ordered.length - 1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((index) => (index >= last ? 0 : index + 1))
        return
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((index) => (index <= 0 ? last : index - 1))
        return
      case 'Enter':
        e.preventDefault()
        active && run(active)
        return
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        onOpenChange(false)
        return
    }
  }

  const listboxId = `${baseId}-listbox`

  return (
    <Portal>
      <FocusTrap focusTrapOptions={{ fallbackFocus: () => inputRef.current }}>
        <div>
          <div className={classes.wrapper}>
            <div
              role='dialog'
              aria-modal='true'
              aria-label={locale.commandPalette.label}
              className={css(classes.dialog, style)}
            >
              <div className={classes.search}>
                <Icon icon='zoomOutline' size={1.25} style={classes.searchIcon} />
                <input
                  ref={inputRef}
                  role='combobox'
                  aria-expanded='true'
                  aria-controls={listboxId}
                  aria-autocomplete='list'
                  aria-activedescendant={active ? optionId(active) : undefined}
                  aria-label={placeholder ?? locale.commandPalette.placeholder}
                  placeholder={placeholder ?? locale.commandPalette.placeholder}
                  autoComplete='off'
                  spellCheck={false}
                  className={classes.input}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActiveIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div ref={listRef} id={listboxId} role='listbox' className={classes.list}>
                {groups.map(([group, groupItems]) => {
                  const headingId = `${baseId}-group-${group.replace(/[^\w-]/g, '_')}`
                  const options = groupItems.map((item) => {
                    const isActive = item === active
                    return (
                      <div
                        key={item.id}
                        id={optionId(item)}
                        role='option'
                        aria-selected={isActive}
                        className={css(classes.option, isActive && classes.active)}
                        onMouseMove={() => !isActive && setActiveIndex(ordered.indexOf(item))}
                        // Keeps the focus in the search box
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => run(item)}
                      >
                        {item.icon && <Icon icon={item.icon} size={1.25} style={classes.optionIcon} />}
                        <span className={classes.optionText}>
                          <span className={classes.optionLabel}>{item.label}</span>
                          {item.description && <span className={classes.optionDescription}>{item.description}</span>}
                        </span>
                        {item.shortcut && <Kbd keys={item.shortcut} aria-hidden='true' />}
                      </div>
                    )
                  })

                  return group ? (
                    <div key={group} role='group' aria-labelledby={headingId}>
                      <div id={headingId} role='presentation' className={classes.groupHeading}>
                        {group}
                      </div>
                      {options}
                    </div>
                  ) : (
                    <React.Fragment key='ungrouped'>{options}</React.Fragment>
                  )
                })}
              </div>

              <div role='status' className={css(ordered.length === 0 && classes.empty)}>
                {ordered.length === 0 && (emptyText ?? locale.commandPalette.empty)}
              </div>

              <div className={classes.footer} aria-hidden='true'>
                <span>
                  <Kbd>↑</Kbd> <Kbd>↓</Kbd> {locale.commandPalette.navigate}
                </span>
                <span>
                  <Kbd>Enter</Kbd> {locale.commandPalette.select}
                </span>
                <span>
                  <Kbd>Esc</Kbd> {locale.commandPalette.close}
                </span>
              </div>
            </div>
          </div>
          <ModalBackdrop depthLevel={2} onClick={() => onOpenChange(false)} />
        </div>
      </FocusTrap>
    </Portal>
  )
}

const createStyles = (theme: Theme) => ({
  wrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: zIndexLevel[2].modalContainer,
    display: 'flex',
    justifyContent: 'center',
    padding: '12vh 1rem 1rem',
    pointerEvents: 'none',
  } as CSSProperties,
  dialog: {
    ...theme.typography.variant('main'),
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '40rem',
    maxHeight: '70vh',
    overflow: 'hidden',
    background: theme.pallete.surface.main,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.modal,
    boxShadow: theme.shadows.outer[160],
    pointerEvents: 'auto',
    animation: `${fadeIn} .15s ease-out`,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  } as CSSProperties,
  search: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 1rem',
    borderBottom: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  searchIcon: {
    flexShrink: 0,
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  input: {
    flex: 1,
    minWidth: 0,
    height: '3.5rem',
    margin: 0,
    padding: 0,
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: theme.pallete.text.main,
    fontFamily: theme.typography.fontFamily,
    fontSize: '1rem',
    '&::placeholder': {
      color: theme.pallete.text.secondary,
    },
  } as CSSProperties,
  list: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0.5rem',
  } as CSSProperties,
  groupHeading: {
    padding: '0.5rem 0.5rem 0.25rem',
    color: theme.pallete.text.secondary,
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  } as CSSProperties,
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minHeight: '2.5rem',
    padding: '0.375rem 0.5rem',
    borderRadius: theme.radius.button,
    cursor: 'pointer',
  } as CSSProperties,
  active: {
    background: theme.pallete.primary.c90,
    color: theme.pallete.primary.c20,
    boxShadow: `inset 3px 0 0 ${theme.pallete.primary.main}`,
  } as CSSProperties,
  optionIcon: {
    flexShrink: 0,
  } as CSSProperties,
  optionText: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  optionLabel: {
    fontWeight: 'bold',
  } as CSSProperties,
  optionDescription: {
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  empty: {
    padding: '1.5rem 1rem 2rem',
    textAlign: 'center',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '0.5rem 1rem',
    borderTop: `1px solid ${theme.pallete.divider}`,
    background: theme.pallete.surface.background,
    color: theme.pallete.text.secondary,
    fontSize: '0.75rem',
  } as CSSProperties,
})
