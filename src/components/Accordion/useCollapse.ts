import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'

// Length of the height animation, in milliseconds
export const COLLAPSE_DURATION = 200

// The layout effect does nothing in server rendering, and React warns about it there
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Without matchMedia, as in server rendering and in tests, nothing animates
const animates = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Styles of the element that gets the ref: printed pages show the collapsed content too
export const collapseStyles = {
  '@media print': {
    '&[hidden]': {
      display: 'block',
    },
  },
} as CSSProperties

/**
 * Animates the height of the content of an expandable item when it expands or collapses. The content keeps
 * `hidden` while collapsed, so it stays out of the page, the tab order and screen readers; while it closes, it
 * is still shown, so it can shrink. Nothing animates when the user asks for reduced motion.
 *
 * The element that gets `ref` must have no padding or border, since its height goes down to 0: put them in an
 * element inside it.
 */
export function useCollapse(expanded: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const [previous, setPrevious] = useState(expanded)
  const stop = useRef<() => void>(null)
  const mounted = useRef(false)

  // Worked out while rendering, so the content is not hidden before it shrinks
  if (previous !== expanded) {
    setPrevious(expanded)
    setClosing(!expanded && animates())
  }

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!mounted.current || !element) {
      mounted.current = true
      return
    }
    // A toggle in the middle of an animation goes on from the height reached; otherwise an expand starts at 0
    const animating = !!stop.current
    const from = animating || !expanded ? element.getBoundingClientRect().height : 0
    stop.current && stop.current()

    if (!animates()) {
      return
    }

    const to = expanded ? element.scrollHeight : 0
    element.style.overflow = 'hidden'
    element.style.height = `${from}px`
    // Reading the layout starts the transition from that height
    element.getBoundingClientRect()
    element.style.transition = `height ${COLLAPSE_DURATION}ms ease`
    element.style.height = `${to}px`

    const finish = () => {
      element.removeEventListener('transitionend', handleEnd)
      clearTimeout(timer)
      element.style.overflow = ''
      element.style.height = ''
      element.style.transition = ''
      stop.current = null
    }
    const handleEnd = (e: TransitionEvent) => {
      if (e.target === element) {
        finish()
        !expanded && setClosing(false)
      }
    }
    // The end of the transition may never come, such as when the element leaves the page
    const timer = setTimeout(() => {
      finish()
      !expanded && setClosing(false)
    }, COLLAPSE_DURATION + 50)

    element.addEventListener('transitionend', handleEnd)
    stop.current = finish
  }, [expanded])

  useEffect(() => () => stop.current && stop.current(), [])

  return { ref, hidden: !expanded && !closing }
}
