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

// The elements sliding open, with what makes them grow, so an item inside one makes room for itself
const opening = new WeakMap<HTMLElement, (delta: number) => void>()

// Styles of the element that gets the ref: printed pages show the collapsed content too
export const collapseStyles = {
  '@media print': {
    '&[hidden]': {
      display: 'block',
    },
  },
} as CSSProperties

export interface UseCollapseOptions {
  /**
   * Height of the element while collapsed, when it is not 0, such as the first lines of a clamped text.
   * Measured, while shown in full, each time it starts to expand or collapse.
   * @default () => 0
   */
  collapsedHeight?(element: HTMLElement): number
}

/**
 * Animates the height of the content of an expandable item when it expands or collapses. The content keeps
 * `hidden` while collapsed, so it stays out of the page, the tab order and screen readers; while it closes, it
 * is still shown, so it can shrink. Nothing animates when the user asks for reduced motion. An item that
 * expands or collapses inside another one still sliding open, such as a nested tree node, makes room in it.
 *
 * The element that gets `ref` must have no padding or border, since its height goes down to 0 (or to
 * `collapsedHeight`): put them in an element inside it. While `hidden` is false, it must be shown in full.
 */
export function useCollapse<E extends HTMLElement = HTMLDivElement>(
  expanded: boolean,
  options: UseCollapseOptions = {}
) {
  const { collapsedHeight } = options
  const ref = useRef<E>(null)
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
    // A toggle in the middle of an animation goes on from the height reached; otherwise an expand starts
    // from the collapsed height
    const animating = !!stop.current
    const reached = animating || !expanded ? element.getBoundingClientRect().height : null
    stop.current && stop.current()

    if (!animates()) {
      return
    }

    const collapsed = collapsedHeight ? collapsedHeight(element) : 0
    const from = reached ?? collapsed
    let to = expanded ? element.scrollHeight : collapsed
    element.style.overflow = 'hidden'
    element.style.height = `${from}px`
    // Reading the layout starts the transition from that height
    element.getBoundingClientRect()
    element.style.transition = `height ${COLLAPSE_DURATION}ms ease`
    element.style.height = `${to}px`

    // The elements around it that are still sliding open, such as the group of a parent item, grow or shrink
    // as much as it does, so they end at their whole height instead of jumping to it at the end
    for (let parent = element.parentElement; parent && to !== from; parent = parent.parentElement) {
      const grow = opening.get(parent)
      grow && grow(to - from)
    }

    const finish = () => {
      element.removeEventListener('transitionend', handleEnd)
      clearTimeout(timer)
      opening.delete(element)
      element.style.overflow = ''
      element.style.height = ''
      element.style.transition = ''
      stop.current = null
    }
    const end = () => {
      finish()
      !expanded && setClosing(false)
    }
    // Only the end of its own transition, not of one inside it, such as of a nested item
    const handleEnd = (e: TransitionEvent) => e.target === element && end()
    // The end of the transition may never come, such as when the element leaves the page
    let timer = setTimeout(end, COLLAPSE_DURATION + 50)

    if (expanded) {
      // A new height starts a new transition, from the height reached
      opening.set(element, (delta) => {
        to += delta
        element.style.height = `${to}px`
        clearTimeout(timer)
        timer = setTimeout(end, COLLAPSE_DURATION + 50)
      })
    }
    element.addEventListener('transitionend', handleEnd)
    stop.current = finish
  }, [expanded])

  useEffect(() => () => stop.current && stop.current(), [])

  return { ref, hidden: !expanded && !closing }
}
