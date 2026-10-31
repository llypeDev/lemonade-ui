import React, { CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { Icon } from '../Icon'
import { VisuallyHidden } from '../VisuallyHidden'

type Key = string | number

export interface SortableListProps<T>
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'style' | 'onChange' | 'children'> {
  /**
   * The items, in their current order
   */
  items: T[]

  /**
   * Called with the items in the new order when the user drops an item in another position
   */
  onChange(items: T[]): void

  /**
   * Unique key of an item
   * @default the `id` of an object, or the item itself for strings and numbers
   */
  getKey?(item: T): Key

  /**
   * Text of an item, for the move button and the announcements to screen readers
   * @default the `label` of an object, or the item itself for strings and numbers
   */
  getLabel?(item: T): string

  /**
   * Content of an item
   * @default its text
   */
  renderItem?(item: T, index: number): React.ReactNode

  style?: ExternalStyles
}

const defaultGetKey = (item: any): Key => (typeof item === 'object' && item !== null ? item.id : item)
const defaultGetLabel = (item: any): string => (typeof item === 'object' && item !== null ? item.label : String(item))

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

function move<K>(list: K[], from: number, to: number) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * A list the user puts in order, by dragging the handle of an item or with the keyboard: Space picks the item
 * up, the arrow keys move it, and Space drops it. Each move is announced to screen readers.
 * Name it with `aria-label`.
 */
export function SortableList<T>(props: SortableListProps<T>) {
  const { items, onChange, getKey = defaultGetKey, getLabel = defaultGetLabel, renderItem, style, ...rest } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const instructionsId = useMemo(() => `sortable-list-${randomStr()}`, [])
  const itemRefs = useRef(new Map<Key, HTMLLIElement>())
  const handleRefs = useRef(new Map<Key, HTMLButtonElement>())

  // While an item is picked up, the list shows this order, and it only reaches onChange when the item is dropped
  const [draft, setDraft] = useState<Key[]>(null)
  const [active, setActive] = useState<{ key: Key; pointer: boolean }>(null)
  const [announcement, setAnnouncement] = useState('')
  // Handle that gets the focus back after a drop or a cancel, when moving its item in the page made it lose it
  const restoreFocus = useRef<Key>(null)

  const byKey = new Map(items.map((item) => [getKey(item), item] as [Key, T]))
  const keys = draft ?? items.map(getKey)

  const announce = (text: string, key: Key, order: Key[]) =>
    setAnnouncement(
      fill(text, { item: getLabel(byKey.get(key)), position: order.indexOf(key) + 1, total: order.length })
    )

  const pickUp = (key: Key, pointer: boolean) => {
    const order = items.map(getKey)
    setDraft(order)
    setActive({ key, pointer })
    announce(locale.sortableList.grabbed, key, order)
  }

  const drop = (keepFocus = true) => {
    const order = draft
    setDraft(null)
    setActive(null)
    if (!order) {
      return
    }
    restoreFocus.current = keepFocus ? active.key : null
    announce(locale.sortableList.dropped, active.key, order)

    const original = items.map(getKey)
    if (order.some((key, index) => key !== original[index])) {
      onChange(order.map((key) => byKey.get(key)))
    }
  }

  const cancel = () => {
    const key = active.key
    setDraft(null)
    setActive(null)
    restoreFocus.current = key
    announce(locale.sortableList.cancelled, key, items.map(getKey))
  }

  const moveTo = (key: Key, to: number) => {
    const from = keys.indexOf(key)
    const target = Math.max(0, Math.min(keys.length - 1, to))
    if (from === target) {
      return
    }

    const order = move(keys, from, target)
    setDraft(order)
    announce(locale.sortableList.moved, key, order)
  }

  // Moving an item in the page makes the browser take the focus from its handle, so it goes back right away,
  // while the item is picked up and after it is dropped
  useLayoutEffect(() => {
    const key = active ? active.key : restoreFocus.current
    // After a drop, only the next update gives the focus back, so it never takes the focus later on
    restoreFocus.current = null
    const handle = key !== null && handleRefs.current.get(key)
    const lost = !document.activeElement || document.activeElement === document.body
    if (handle && document.activeElement !== handle && (active || lost)) {
      handle.focus()
    }
  })

  const handleKeyDown = (key: Key) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const grabbed = active && active.key === key

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (grabbed) {
        drop()
      } else if (!active) {
        pickUp(key, false)
      }
      return
    }

    if (!grabbed) {
      return
    }

    const index = keys.indexOf(key)
    const targets: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      Home: 0,
      End: keys.length - 1,
    }

    if (e.key in targets) {
      e.preventDefault()
      moveTo(key, targets[e.key])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      cancel()
    }
  }

  const handlePointerDown = (key: Key) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || active) {
      return
    }
    // Keeps the drag from selecting text
    e.preventDefault()
    e.currentTarget.focus()
    pickUp(key, true)
  }

  // The item goes to the place of the first other item whose middle is below the pointer
  const handlePointerMove = (e: PointerEvent) => {
    const key = active.key
    const others = keys.filter((other) => other !== key)
    const index = others.findIndex((other) => {
      const element = itemRefs.current.get(other)
      if (!element) {
        return false
      }
      const rect = element.getBoundingClientRect()
      return e.clientY < rect.top + rect.height / 2
    })
    moveTo(key, index === -1 ? others.length : index)
  }

  // The pointer is followed in the whole page: moving the item in the page would end a pointer capture
  const pointerHandlers = useRef({ move: handlePointerMove, drop, cancel })
  pointerHandlers.current = { move: handlePointerMove, drop, cancel }
  const dragging = !!active && active.pointer

  useEffect(() => {
    if (!dragging) {
      return
    }

    const handleMove = (e: PointerEvent) => pointerHandlers.current.move(e)
    const handleUp = () => pointerHandlers.current.drop()
    const handleCancel = () => pointerHandlers.current.cancel()

    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
    document.addEventListener('pointercancel', handleCancel)
    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
      document.removeEventListener('pointercancel', handleCancel)
    }
  }, [dragging])

  const handleBlur = (key: Key) => () => {
    // Leaving the handle with Tab drops the item where it is
    if (active && !active.pointer && active.key === key) {
      setTimeout(() => {
        const handle = handleRefs.current.get(key)
        if (handle && document.activeElement !== handle) {
          drop(false)
        }
      })
    }
  }

  return (
    <>
      <ul className={css(classes.list, style)} {...rest}>
        {keys.map((key, index) => {
          const item = byKey.get(key)
          if (item === undefined) {
            return null
          }
          const label = getLabel(item)
          const grabbed = !!active && active.key === key

          return (
            <li
              key={key}
              ref={(element) => (element ? itemRefs.current.set(key, element) : itemRefs.current.delete(key))}
              className={css(classes.item, grabbed && classes.grabbed)}
            >
              <button
                ref={(element) => (element ? handleRefs.current.set(key, element) : handleRefs.current.delete(key))}
                type='button'
                className={classes.handle}
                aria-label={fill(locale.sortableList.move, { item: label })}
                aria-describedby={instructionsId}
                aria-pressed={grabbed}
                onKeyDown={handleKeyDown(key)}
                onPointerDown={handlePointerDown(key)}
                onBlur={handleBlur(key)}
              >
                <Icon icon='dragdrop' size={1.25} />
              </button>
              <div className={classes.content}>{renderItem ? renderItem(item, index) : label}</div>
            </li>
          )
        })}
      </ul>
      <VisuallyHidden id={instructionsId}>{locale.sortableList.instructions}</VisuallyHidden>
      <VisuallyHidden role='status' aria-live='assertive' aria-atomic>
        {announcement}
      </VisuallyHidden>
    </>
  )
}

const createStyles = (theme: Theme) => ({
  list: {
    ...theme.typography.variant('main'),
    listStyle: 'none',
    margin: 0,
    padding: 0,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    background: theme.pallete.surface.main,
  } as CSSProperties,
  item: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '3rem',
    boxSizing: 'border-box',
    padding: '0.5rem 1rem 0.5rem 0.5rem',
    background: theme.pallete.surface.main,
    '& + &': {
      borderTop: `1px solid ${theme.pallete.divider}`,
    },
    '&:first-of-type': {
      borderTopLeftRadius: theme.radius.paper,
      borderTopRightRadius: theme.radius.paper,
    },
    '&:last-of-type': {
      borderBottomLeftRadius: theme.radius.paper,
      borderBottomRightRadius: theme.radius.paper,
    },
  } as CSSProperties,
  grabbed: {
    zIndex: 1,
    boxShadow: `inset 0.25rem 0 0 ${theme.pallete.primary.main}, ${theme.shadows.outer[40]}`,
  } as CSSProperties,
  handle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '2rem',
    height: '2rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: theme.radius.button,
    background: 'transparent',
    color: theme.pallete.text.secondary,
    cursor: 'grab',
    outline: 'none',
    touchAction: 'none',
    transition: 'background .2s, color .2s',
    '&:hover': {
      background: theme.pallete.surface.background,
      color: theme.pallete.text.main,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
    '&[aria-pressed="true"]': {
      cursor: 'grabbing',
      color: theme.pallete.primary.main,
      background: theme.pallete.primary.c90,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  content: {
    flex: 1,
    minWidth: 0,
    overflowWrap: 'anywhere',
  } as CSSProperties,
})
