import { VirtualElement } from '@popperjs/core'
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePopper } from 'react-popper'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { DropdownMenu } from '../Dropdown/DropdownMenu'
import { Portal } from '../Portal'
import { RootRef } from '../RootRef'

export interface ContextMenuProps {
  /**
   * Items of the menu, such as `DropdownItem` and `DropdownDivider`
   */
  menu: React.ReactNode

  /**
   * The element that opens the menu with a right click, a long press on touch screens, or `Shift + F10` and the
   * context menu key while it has the focus
   */
  children: React.ReactElement

  /**
   * Name of the menu for screen readers, such as "Actions for Contract.pdf"
   */
  label?: string

  /**
   * Keeps the menu of the browser
   * @default false
   */
  disabled?: boolean

  /**
   * Called when the menu opens and closes
   */
  onOpenChange?(open: boolean): void

  /**
   * Styles of the menu
   */
  style?: ExternalStyles
}

interface Point {
  x: number
  y: number
}

const longPressDelay = 500
// A finger that moves more than this, in pixels, is scrolling, not pressing
const longPressTolerance = 10

const pointAt = ({ x, y }: Point): VirtualElement => ({
  getBoundingClientRect: () =>
    ({ x, y, top: y, left: x, bottom: y, right: x, width: 0, height: 0, toJSON: () => null } as DOMRect),
})

/**
 * Menu of actions that opens where the user right clicks an element, or long presses it on a touch screen,
 * such as the actions of a file. The keyboard opens it with `Shift + F10` or the context menu key.
 * Every action in it should also be reachable another way, such as a button or a `Dropdown`.
 */
export function ContextMenu(props: ContextMenuProps) {
  const { menu, children, label, disabled = false, onOpenChange, style } = props
  const child = React.Children.only(children)

  const { classes } = useStyles(createStyles)
  const targetRef = useRef<HTMLElement>(null)
  const [menuRef, setMenuRef] = useState<HTMLUListElement>(null)
  const [point, setPoint] = useState<Point>(null)
  // Element that had the focus before the menu opened, to get it back after
  const returnFocus = useRef<HTMLElement>(null)
  // Ignores the contextmenu event that some browsers send after the keyboard or a long press opened the menu
  const openedAt = useRef(0)
  const longPress = useRef<{ timeout: any; start: Point }>(null)

  const open = !!point
  const reference = useMemo(() => (point ? pointAt(point) : null), [point])

  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(reference, menuRef, { placement: 'bottom-start', strategy: 'fixed' })

  const show = (at: Point) => {
    if (!open) {
      returnFocus.current = document.activeElement as HTMLElement
      onOpenChange && onOpenChange(true)
    }
    openedAt.current = Date.now()
    setPoint(at)
  }

  const close = useCallback(
    (restoreFocus: boolean) => {
      setPoint(null)
      onOpenChange && onOpenChange(false)
      const element = returnFocus.current
      returnFocus.current = null
      if (restoreFocus && element && element.focus && document.contains(element)) {
        element.focus({ preventScroll: true })
      }
    },
    [onOpenChange]
  )

  // Under the element when the keyboard opens the menu
  const pointUnderTarget = (): Point => {
    const rect = targetRef.current.getBoundingClientRect()
    return { x: rect.left, y: rect.bottom }
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    child.props.onContextMenu && child.props.onContextMenu(e)
    if (disabled || e.defaultPrevented) {
      return
    }

    e.preventDefault()
    if (Date.now() - openedAt.current < longPressDelay) {
      return
    }
    // Some browsers send the event of the context menu key without a position
    const fromKeyboard = e.clientX === 0 && e.clientY === 0
    show(fromKeyboard ? pointUnderTarget() : { x: e.clientX, y: e.clientY })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    child.props.onKeyDown && child.props.onKeyDown(e)
    if (disabled || e.defaultPrevented) {
      return
    }

    if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') {
      e.preventDefault()
      show(pointUnderTarget())
    }
  }

  const cancelLongPress = () => {
    if (longPress.current) {
      clearTimeout(longPress.current.timeout)
      longPress.current = null
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    child.props.onPointerDown && child.props.onPointerDown(e)
    if (disabled || e.pointerType !== 'touch') {
      return
    }

    cancelLongPress()
    const start = { x: e.clientX, y: e.clientY }
    longPress.current = {
      start,
      timeout: setTimeout(() => {
        longPress.current = null
        show(start)
      }, longPressDelay),
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    child.props.onPointerMove && child.props.onPointerMove(e)
    const press = longPress.current
    if (press && Math.hypot(e.clientX - press.start.x, e.clientY - press.start.y) > longPressTolerance) {
      cancelLongPress()
    }
  }

  const handlePointerEnd = (handler: (e: React.PointerEvent<HTMLElement>) => void) => (
    e: React.PointerEvent<HTMLElement>
  ) => {
    handler && handler(e)
    cancelLongPress()
  }

  useEffect(() => cancelLongPress, [])

  // Moves the focus to the first item when the menu opens
  useEffect(() => {
    if (menuRef) {
      const first = menuRef.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
      ;(first ?? menuRef).focus({ preventScroll: true })
    }
  }, [menuRef])

  // Closes with Escape, a press outside, a scroll of the page or a resize of the window
  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close(true)
      }
    }
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef && !menuRef.contains(e.target as Node)) {
        close(false)
      }
    }
    const handleScroll = (e: Event) => {
      if (!menuRef || !menuRef.contains(e.target as Node)) {
        close(false)
      }
    }
    const handleResize = () => close(false)

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [open, close, menuRef])

  // An item that is chosen closes the menu, unless it is disabled, which stops the click
  const handleMenuClick = () => close(true)

  // Tab, or a click on another element, takes the focus out and closes the menu
  const handleMenuBlur = (e: React.FocusEvent<HTMLUListElement>) => {
    const next = e.relatedTarget as Node
    if (next && menuRef && !menuRef.contains(next)) {
      close(false)
    }
  }

  return (
    <>
      <RootRef rootRef={targetRef}>
        {React.cloneElement(child, {
          'aria-keyshortcuts': disabled ? undefined : 'Shift+F10',
          onContextMenu: handleContextMenu,
          onKeyDown: handleKeyDown,
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerEnd(child.props.onPointerUp),
          onPointerCancel: handlePointerEnd(child.props.onPointerCancel),
        })}
      </RootRef>

      {open && (
        <Portal>
          <DropdownMenu
            innerRef={setMenuRef}
            aria-label={label}
            tabIndex={-1}
            style={[popperStyle as any, classes.menu, style]}
            onClick={handleMenuClick}
            onBlur={handleMenuBlur}
            onContextMenu={(e) => e.preventDefault()}
            {...popperAttributes}
          >
            {menu}
          </DropdownMenu>
        </Portal>
      )}
    </>
  )
}

const createStyles = (theme: Theme) => ({
  menu: {
    zIndex: theme.zIndex.dropdown,
    outline: 'none',
  } as CSSProperties,
})
