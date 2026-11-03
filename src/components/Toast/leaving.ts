import React, { useCallback, useEffect, useRef } from 'react'

// Length of the collapse of the space a toast took, in milliseconds
export const COLLAPSE_DURATION = 200

/**
 * Takes a toast off the page in two steps once `leaving` turns true: after `slideDuration`, the time its own styles
 * take to fade or slide it out, the space it took collapses, so the toasts around it move into place smoothly; then
 * `onLeft` is called, to remove it. Only for when the page animates: without motion, remove the toast at once.
 *
 * The element of `ref` wraps the toast and must have no padding or border, since its height goes down to 0.
 */
export function useLeaving(
  ref: React.RefObject<HTMLElement>,
  leaving: boolean,
  slideDuration: number,
  onLeft: () => void
) {
  // The latest onLeft, so a new function given on each render does not start the steps again
  const onLeftRef = useRef(onLeft)
  onLeftRef.current = onLeft

  useEffect(() => {
    if (!leaving) {
      return
    }

    let timer = setTimeout(() => {
      const element = ref.current
      if (element) {
        element.style.height = `${element.getBoundingClientRect().height}px`
        element.style.overflow = 'hidden'
        // Reading the layout starts the transition from that height
        element.getBoundingClientRect()
        element.style.transition = `height ${COLLAPSE_DURATION}ms ease-in-out`
        element.style.height = '0px'
      }
      // A timer rather than the end of the transition, which may never come, such as in a tab in the background
      timer = setTimeout(() => onLeftRef.current(), COLLAPSE_DURATION)
    }, slideDuration)

    return () => clearTimeout(timer)
  }, [ref, leaving, slideDuration])
}

/**
 * Keeps, for the element of a list of toasts, the element that had the focus before the focus entered the list,
 * so the focus can go back there when the toasts close. Give `onFocus` to the element of the list.
 */
export function useFocusOrigin() {
  const originRef = useRef<HTMLElement | null>(null)

  const onFocus = useCallback((event: React.FocusEvent<HTMLElement>) => {
    const from = event.relatedTarget as HTMLElement | null
    // The focus also moves from toast to toast, as they close
    if (!event.currentTarget.contains(from)) {
      originRef.current = from
    }
  }, [])

  return { originRef, onFocus }
}

/**
 * Moves the focus out of a toast that is closing, when the focus is in it, to the first of `targets` that takes it
 * (such as the close button of the next toast, of the previous one, and then the element the focus came from), and
 * to the body as a last resort. It runs before the toast leaves the accessibility tree, so the focus is never in an
 * element that is hidden or removed.
 */
export function moveFocusOut(toast: Element | null, targets: (HTMLElement | null | undefined)[]) {
  if (!toast || !toast.contains(document.activeElement)) {
    return
  }

  for (const target of targets) {
    // The element the focus came from can be gone, or no longer take the focus, such as a disabled button
    if (target && typeof target.focus === 'function' && target.isConnected) {
      target.focus()
    }
    if (!toast.contains(document.activeElement)) {
      return
    }
  }

  const active = document.activeElement as HTMLElement
  active.blur && active.blur()
}
