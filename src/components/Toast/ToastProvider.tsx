import { keyframes } from 'emotion'
import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { Theme, useStyles } from '../../styles'
import { Portal } from '../Portal'
import { animates } from '../Transition/animates'
import { leavingAttributes, leavingStyles } from '../Transition/leaving'

import { moveFocusOut, useFocusOrigin, useLeaving } from './leaving'
import { Toast, ToastType } from './Toast'

export interface ToastOptions {
  type?: ToastType
  title?: React.ReactNode
  message: React.ReactNode

  /**
   * A link or button that lets the user respond to the message
   */
  action?: React.ReactNode

  /**
   * Milliseconds until the toast closes by itself, counted again after the pointer or focus leaves it.
   * Use `0` to keep it open until the user closes it.
   * @default 5000
   */
  duration?: number

  /**
   * Called when the toast closes, by the user or by its timer
   */
  onClose?(): void
}

export interface ToastContextValue {
  /**
   * Shows a toast and returns its id. A toast identical to one on the screen or waiting to show (same type, and the
   * same title and message by `===`, such as the same text) is not added again: its id is returned, and the one on
   * the screen counts its time again. The `onClose` of each call is called when that toast closes.
   */
  show(options: ToastOptions): number

  /**
   * Closes the toast with the given id
   */
  close(id: number): void
}

const ToastContext = React.createContext<ToastContextValue>(null)

export interface ToastProviderProps {
  children?: React.ReactNode

  /**
   * Element the toast list is rendered into
   * @default document.body
   */
  container?: Element

  /**
   * Most toasts on the screen at once, at least 1. Further toasts wait, and show in order as the ones on the screen
   * leave.
   * @default 3
   */
  limit?: number
}

interface ToastEntry extends ToastOptions {
  id: number

  // Counts the identical toasts shown while this one was on the screen: each one counts its time again
  repeats: number

  // Closed, and animating out of the page
  leaving: boolean
}

interface ToastList {
  // On the screen, in the order they were shown, with the ones leaving it
  shown: ToastEntry[]

  // Waiting for room on the screen, in the order they were shown
  waiting: ToastEntry[]
}

// The elements of the toasts on the screen and their close buttons, by id, for the focus to go from toast to toast
interface ToastElements {
  toasts: Map<number, HTMLElement>
  closeButtons: Map<number, HTMLElement>
}

// Length of the fade and slide out of a toast that closes, before its space collapses, in milliseconds
const EXIT_DURATION = 200

const noToasts: ToastList = { shown: [], waiting: [] }

let lastToastId = 0

const isIdentical = (entry: ToastEntry, options: ToastOptions) =>
  !entry.leaving &&
  (entry.type || 'info') === (options.type || 'info') &&
  entry.title === options.title &&
  entry.message === options.message

// The callbacks of a toast and of the identical ones shown while it was there
const both = (first: () => void, second: () => void) =>
  first && second
    ? () => {
        first()
        second()
      }
    : first || second

/**
 * Shows toasts requested through `useToast` at the bottom left of the screen.
 */
export function ToastProvider(props: ToastProviderProps) {
  const { children, container, limit = 3 } = props
  const { classes } = useStyles(createStyles)
  const [toasts, setToasts] = useState<ToastList>(noToasts)
  // The toasts as of the last show or close, which may not be rendered yet, so `close` finds a toast that
  // was just shown and calls its `onClose` once, outside of the state update
  const toastsRef = useRef<ToastList>(noToasts)
  const limitRef = useRef(limit)
  limitRef.current = limit
  const [elements] = useState<ToastElements>(() => ({ toasts: new Map(), closeButtons: new Map() }))
  const { originRef, onFocus } = useFocusOrigin()

  const update = useCallback((list: ToastList) => {
    // Waiting toasts take the room left on the screen
    const max = limitRef.current >= 1 ? Math.floor(limitRef.current) : 1
    const room = max - list.shown.length
    const next =
      room > 0 && list.waiting.length > 0
        ? { shown: [...list.shown, ...list.waiting.slice(0, room)], waiting: list.waiting.slice(room) }
        : list

    toastsRef.current = next
    setToasts(next)
  }, [])

  // A higher limit makes room at once
  useEffect(() => {
    update(toastsRef.current)
  }, [limit, update])

  const show = useCallback(
    (options: ToastOptions) => {
      const { shown, waiting } = toastsRef.current

      // The same message shown again, such as when the user saves twice, does not stack: the toast stays for the
      // full duration after the last time, and the screen reader does not hear it twice
      const identical = [...shown, ...waiting].find((entry) => isIdentical(entry, options))
      if (identical) {
        const repeated = {
          ...identical,
          repeats: identical.repeats + 1,
          onClose: both(identical.onClose, options.onClose),
        }
        const replace = (list: ToastEntry[]) => list.map((entry) => (entry === identical ? repeated : entry))
        update({ shown: replace(shown), waiting: replace(waiting) })
        return identical.id
      }

      const id = ++lastToastId
      update({ shown, waiting: [...waiting, { ...options, id, repeats: 0, leaving: false }] })
      return id
    },
    [update]
  )

  const close = useCallback(
    (id: number) => {
      const { shown, waiting } = toastsRef.current
      const toast = [...shown, ...waiting].find((entry) => entry.id === id && !entry.leaving)
      if (!toast) {
        return
      }

      // Before it leaves the accessibility tree, the focus goes to the next toast still open, or the previous one,
      // or back to where it came from
      const index = shown.indexOf(toast)
      if (index >= 0) {
        const isOpen = (entry: ToastEntry) => !entry.leaving
        const next = shown.slice(index + 1).find(isOpen)
        const previous = shown.slice(0, index).reverse().find(isOpen)
        moveFocusOut(elements.toasts.get(id), [
          next && elements.closeButtons.get(next.id),
          previous && elements.closeButtons.get(previous.id),
          originRef.current,
        ])
      }

      // It stays on the page while it animates out, and waiting toasts show once it has left
      const motion = animates()
      update({
        shown: motion
          ? shown.map((entry) => (entry === toast ? { ...entry, leaving: true } : entry))
          : shown.filter((entry) => entry !== toast),
        waiting: waiting.filter((entry) => entry !== toast),
      })
      toast.onClose && toast.onClose()
    },
    [elements, originRef, update]
  )

  const remove = useCallback(
    (id: number) => {
      const { shown, waiting } = toastsRef.current
      update({ shown: shown.filter((entry) => entry.id !== id), waiting })
    },
    [update]
  )

  const value = useMemo(() => ({ show, close }), [show, close])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal container={container}>
        <div className={classes.list} aria-live='polite' onFocus={onFocus}>
          {toasts.shown.map((toast) => (
            <ToastItem key={toast.id} toast={toast} elements={elements} onClose={close} onLeft={remove} />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  )
}

/**
 * Returns `show` and `close` to control the toasts of the nearest `ToastProvider`.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider')
  }

  return context
}

interface ToastItemProps {
  toast: ToastEntry
  elements: ToastElements
  onClose(id: number): void
  onLeft(id: number): void
}

function ToastItem(props: ToastItemProps) {
  const { toast, elements, onClose, onLeft } = props
  const { id, type, title, message, action, duration = 5000, repeats, leaving } = toast
  const { classes, css } = useStyles(createStyles)

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const hoveredRef = useRef(false)
  const focusedRef = useRef(false)
  // A toast that has the focus when it is removed gets a blur, which would start a timer after the cleanup
  const isMounted = useIsMounted()

  const stopTimer = useCallback(() => {
    clearTimeout(timerRef.current)
  }, [])

  // The time counts while the toast is neither hovered nor focused, until it closes
  const startTimer = useCallback(() => {
    stopTimer()
    if (duration > 0 && !leaving && !hoveredRef.current && !focusedRef.current) {
      timerRef.current = setTimeout(() => isMounted.current && onClose(id), duration)
    }
  }, [duration, id, isMounted, leaving, onClose, stopTimer])

  // An identical toast shown again counts the time again
  useEffect(() => {
    startTimer()
    return stopTimer
  }, [startTimer, stopTimer, repeats])

  const elementRef = useRef<HTMLDivElement>(null)
  useLeaving(elementRef, leaving, EXIT_DURATION, () => onLeft(id))

  const setElement = useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current = element
      if (element) {
        elements.toasts.set(id, element)
      } else {
        elements.toasts.delete(id)
      }
    },
    [elements, id]
  )

  const setCloseButton = useCallback(
    (button: HTMLButtonElement | null) => {
      if (button) {
        elements.closeButtons.set(id, button)
      } else {
        elements.closeButtons.delete(id)
      }
    },
    [elements, id]
  )

  const handleMouseEnter = () => {
    hoveredRef.current = true
    stopTimer()
  }

  const handleMouseLeave = () => {
    hoveredRef.current = false
    startTimer()
  }

  const handleFocus = () => {
    focusedRef.current = true
    stopTimer()
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Keep it open while the focus moves between elements inside the toast
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      focusedRef.current = false
      startTimer()
    }
  }

  return (
    <div
      ref={setElement}
      className={css(classes.item, leaving && classes.leaving)}
      {...(leaving ? leavingAttributes : undefined)}
    >
      <Toast
        type={type}
        title={title}
        action={action}
        closeButtonRef={setCloseButton}
        onClose={() => onClose(id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={classes.toast}
      >
        {message}
      </Toast>
    </div>
  )
}

const enter = keyframes({
  from: { opacity: 0, transform: 'translateX(-1rem)' },
  to: { opacity: 1, transform: 'translateX(0)' },
})

const createStyles = (theme: Theme) => ({
  list: {
    position: 'fixed',
    left: '1rem',
    bottom: '1rem',
    zIndex: theme.zIndex.toast,
    display: 'flex',
    flexDirection: 'column',
    width: 'calc(100vw - 2rem)',
    maxWidth: '24rem',
    pointerEvents: 'none',
  } as CSSProperties,
  item: {
    // A toast that closes fades and slides back to where it came from, and then its space collapses
    transition: `opacity ${EXIT_DURATION}ms ease-in, transform ${EXIT_DURATION}ms ease-in`,
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  leaving: {
    ...leavingStyles,
    opacity: 0,
    transform: 'translateX(-1rem)',
  } as CSSProperties,
  toast: {
    // The space between toasts belongs to each one, so it collapses with the toast that leaves
    marginTop: '0.5rem',
    pointerEvents: 'auto',
    animation: `${enter} .2s ease-out`,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  } as CSSProperties,
})
