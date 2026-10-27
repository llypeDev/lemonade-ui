import { keyframes } from 'emotion'
import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { Theme, useStyles } from '../../styles'
import { Portal } from '../Portal'

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
   * Shows a toast and returns its id
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
}

interface ToastEntry extends ToastOptions {
  id: number
}

let lastToastId = 0

/**
 * Shows toasts requested through `useToast` at the bottom left of the screen.
 */
export function ToastProvider(props: ToastProviderProps) {
  const { children, container } = props
  const { classes } = useStyles(createStyles)
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const close = useCallback((id: number) => {
    setToasts((current) => {
      const toast = current.find((entry) => entry.id === id)
      toast && toast.onClose && toast.onClose()
      return current.filter((entry) => entry.id !== id)
    })
  }, [])

  const show = useCallback((options: ToastOptions) => {
    const id = ++lastToastId
    setToasts((current) => [...current, { ...options, id }])
    return id
  }, [])

  const value = useMemo(() => ({ show, close }), [show, close])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal container={container}>
        <div className={classes.list} aria-live='polite'>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={close} />
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
  onClose(id: number): void
}

function ToastItem(props: ToastItemProps) {
  const { toast, onClose } = props
  const { id, type, title, message, action, duration = 5000 } = toast
  const { classes } = useStyles(createStyles)

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const stopTimer = useCallback(() => {
    clearTimeout(timerRef.current)
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    if (duration > 0) {
      timerRef.current = setTimeout(() => onClose(id), duration)
    }
  }, [duration, id, onClose, stopTimer])

  useEffect(() => {
    startTimer()
    return stopTimer
  }, [startTimer, stopTimer])

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // Keep it open while the focus moves between elements inside the toast
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      startTimer()
    }
  }

  return (
    <Toast
      type={type}
      title={title}
      action={action}
      onClose={() => onClose(id)}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
      onFocus={stopTimer}
      onBlur={handleBlur}
      style={classes.item}
    >
      {message}
    </Toast>
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
    gap: '0.5rem',
    width: 'calc(100vw - 2rem)',
    maxWidth: '24rem',
    pointerEvents: 'none',
  } as CSSProperties,
  item: {
    pointerEvents: 'auto',
    animation: `${enter} .2s ease-out`,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  } as CSSProperties,
})
