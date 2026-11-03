import { useEffect, useLayoutEffect, useState } from 'react'

// The layout effect does nothing in server rendering, and React warns about it there
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Gives the focus back, as soon as `open` turns false, to the element that had it when `open` turned true.
 *
 * An overlay that stays on the page while it animates out releases its focus trap when it starts to close, and
 * gives the focus back at that moment rather than when it leaves the page, so the focus is not taken from where the
 * user moved it in the meantime. When the overlay is removed while open, its focus trap gives the focus back.
 */
export function useReturnFocus(open: boolean) {
  // Read while rendering, as the focus trap does, so it is not an element of the overlay with `autoFocus`
  const [state, setState] = useState<{ open: boolean; opener: HTMLElement | null }>({ open: false, opener: null })
  if (state.open !== open) {
    const focused = open && typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null
    setState({ open, opener: open ? focused : state.opener })
  }

  const { opener } = state

  // A layout effect runs after the focus trap of the overlay, a child, is released, and before the browser hides the
  // overlay from screen readers while the focus is still in it
  useIsomorphicLayoutEffect(() => {
    if (!open && opener && typeof opener.focus === 'function') {
      opener.focus()
    }
  }, [open, opener])
}
