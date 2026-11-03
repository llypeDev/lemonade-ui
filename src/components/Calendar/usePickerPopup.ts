import React, { useEffect, useRef, useState } from 'react'

import { useOverlayEscape } from '../../hooks/useOverlayEscape'

export interface PickerPopupOptions {
  /**
   * The popup element, while it is open
   */
  popup: HTMLElement | null | undefined

  /**
   * Moves the focus to the element of the popup that is in the tab order, such as the day of a calendar
   */
  focusTabStop(popup: HTMLElement, options?: FocusOptions): void

  /**
   * The input that gets the focus back when `Escape` closes the popup
   */
  getInput(): HTMLElement | null | undefined

  /**
   * Other elements out of the popup whose focus goes back to the input on `Escape`, such as the calendar button
   */
  isOwnElement?(element: Element): boolean
}

/**
 * Open state of the popup of a date or month field, which follows the date picker dialog of WAI-ARIA APG:
 * - The field opens it with a click, not when it gets the focus, so Tab goes through a form without popups
 * - `Alt+ArrowDown` in the input opens it and moves the focus into it
 * - `Escape` closes it, giving the focus back to the input, and not the dialog or menu under it
 */
export function usePickerPopup(options: PickerPopupOptions) {
  const { popup, focusTabStop, getInput, isOwnElement } = options

  const [open, setOpen] = useState(false)
  const focusOnOpen = useRef(false)

  // A popup that just opened may not be in its place yet, and scrolling to it would move the page
  useEffect(() => {
    if (popup && focusOnOpen.current) {
      focusOnOpen.current = false
      focusTabStop(popup, { preventScroll: true })
    }
  }, [popup, focusTabStop])

  useOverlayEscape(open, () => {
    const active = document.activeElement
    const input = getInput()
    if (input && active && active !== input && (popup?.contains(active) || isOwnElement?.(active))) {
      input.focus()
    }
    focusOnOpen.current = false
    setOpen(false)
  })

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault()
      if (open && popup) {
        focusTabStop(popup, { preventScroll: true })
      } else {
        focusOnOpen.current = true
        setOpen(true)
      }
    }
  }

  return { open, setOpen, handleInputKeyDown }
}
