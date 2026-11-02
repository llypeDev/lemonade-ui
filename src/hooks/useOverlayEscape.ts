import { useEffect, useRef } from 'react'

// Overlays that are open, such as modals, drawers and menus, the last one opened on top
const openOverlays: object[] = []

// Escape events already handled by the overlay on top. When it closes, it may leave the list before the event
// reaches the listener of the overlay under it, which must not close too.
const handledEvents = new WeakSet<Event>()

/**
 * Calls `onEscape` when the `Escape` key is pressed while `active` is true and this overlay is the last one opened
 * that is still open. So `Escape` closes a dialog opened from another dialog, or a menu opened in a dialog, without
 * closing what is under it.
 */
export function useOverlayEscape(active: boolean, onEscape: (e: KeyboardEvent) => void) {
  // The latest handler runs without listening again on every render
  const handlerRef = useRef(onEscape)
  handlerRef.current = onEscape

  useEffect(() => {
    if (!active) {
      return
    }

    const overlay = {}
    openOverlays.push(overlay)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !handledEvents.has(e) && openOverlays[openOverlays.length - 1] === overlay) {
        handledEvents.add(e)
        handlerRef.current(e)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      openOverlays.splice(openOverlays.indexOf(overlay), 1)
    }
  }, [active])
}
