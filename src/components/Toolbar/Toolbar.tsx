import React, { CSSProperties, useCallback, useEffect, useRef } from 'react'

import { ExternalStyles, useStyles } from '../../styles'
import { Omit } from '../../util'

export type ToolbarOrientation = 'horizontal' | 'vertical'

export interface ToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * Direction of the items, which also sets the arrow keys that move between them
   * @default 'horizontal'
   */
  orientation?: ToolbarOrientation

  children?: React.ReactNode
  style?: ExternalStyles
}

const itemSelector = 'button, a[href], input, select, textarea, [tabindex]'
const rovingAttribute = 'data-toolbar-item'

const isTextField = (element: HTMLElement) => {
  if (element.isContentEditable || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    return true
  }

  return (
    element.tagName === 'INPUT' &&
    !['button', 'checkbox', 'radio', 'reset', 'submit'].includes((element as HTMLInputElement).type)
  )
}

/**
 * Group of controls, such as the formatting buttons of an editor or the bulk actions of a table. It is a single
 * stop of the Tab key; the arrow keys, Home and End move between its controls. Name it with `aria-label`.
 */
export function Toolbar(props: ToolbarProps) {
  const { orientation = 'horizontal', onKeyDown, onFocus, style, children, ...rest } = props
  const { classes, css } = useStyles(createStyles, orientation)
  const ref = useRef<HTMLDivElement>(null)
  const activeIndex = useRef(0)

  const getItems = useCallback(
    () =>
      Array.from(ref.current.querySelectorAll<HTMLElement>(itemSelector)).filter(
        (element) =>
          !(element as HTMLButtonElement).disabled &&
          // Leaves out elements that were never focusable by Tab, unless this toolbar made them so
          (element.getAttribute('tabindex') !== '-1' || element.hasAttribute(rovingAttribute)) &&
          element.closest('[role="toolbar"]') === ref.current
      ),
    []
  )

  // Only the active item is reachable by Tab
  const sync = useCallback(() => {
    const items = getItems()
    activeIndex.current = Math.min(activeIndex.current, Math.max(items.length - 1, 0))
    items.forEach((element, index) => {
      element.setAttribute(rovingAttribute, '')
      element.setAttribute('tabindex', index === activeIndex.current ? '0' : '-1')
    })
  }, [getItems])

  useEffect(sync)

  // Items can be added, removed or disabled without a render of the toolbar
  useEffect(() => {
    const observer = new MutationObserver(sync)
    observer.observe(ref.current, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
    return () => observer.disconnect()
  }, [sync])

  const indexOf = (items: HTMLElement[], target: EventTarget) =>
    items.findIndex((element) => element === target || element.contains(target as Node))

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    onFocus && onFocus(e)

    const index = indexOf(getItems(), e.target)
    if (index >= 0 && index !== activeIndex.current) {
      activeIndex.current = index
      sync()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown && onKeyDown(e)

    const vertical = orientation === 'vertical'
    const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft'
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight'

    if (e.defaultPrevented || ![previousKey, nextKey, 'Home', 'End'].includes(e.key)) {
      return
    }

    // The arrow keys move the caret of a text field
    if (isTextField(e.target as HTMLElement)) {
      return
    }

    const items = getItems()
    const current = indexOf(items, e.target)
    if (current < 0) {
      return
    }

    const last = items.length - 1
    const next =
      e.key === nextKey
        ? current === last
          ? 0
          : current + 1
        : e.key === previousKey
        ? current === 0
          ? last
          : current - 1
        : e.key === 'Home'
        ? 0
        : last

    e.preventDefault()
    activeIndex.current = next
    sync()
    items[next].focus()
  }

  return (
    <div
      ref={ref}
      role='toolbar'
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      className={css(classes.toolbar, style)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...rest}
    >
      {children}
    </div>
  )
}

const createStyles = (_theme: unknown, orientation: ToolbarOrientation) => ({
  toolbar: {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    flexWrap: orientation === 'vertical' ? 'nowrap' : 'wrap',
    alignItems: orientation === 'vertical' ? 'stretch' : 'center',
    gap: '0.25rem',
  } as CSSProperties,
})
