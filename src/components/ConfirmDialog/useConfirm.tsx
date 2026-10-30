import React, { useCallback, useContext, useRef, useState } from 'react'

import { isPromise } from '../../util'

import { ConfirmDialog, ConfirmDialogProps } from './ConfirmDialog'

export interface ConfirmOptions extends Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel' | 'children'> {
  /**
   * Content below the description, such as a checkbox
   */
  content?: React.ReactNode

  /**
   * Work done before the dialog closes, such as a request. While its promise is pending, the confirm button
   * shows a spinner; if it rejects, the dialog stays open and the promise of `confirm` does not settle yet.
   */
  onConfirm?(): void | Promise<unknown>
}

export type Confirm = (options: ConfirmOptions) => Promise<boolean>

interface PendingConfirm {
  options: ConfirmOptions
  resolve(confirmed: boolean): void
}

const ConfirmContext = React.createContext<Confirm>(null)

export interface ConfirmDialogProviderProps {
  children?: React.ReactNode
}

/**
 * Renders the dialog opened by `useConfirm`. Place it once, near the root of the application.
 */
export function ConfirmDialogProvider(props: ConfirmDialogProviderProps) {
  const { children } = props
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const [open, setOpen] = useState(false)
  const pendingRef = useRef<PendingConfirm | null>(null)

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        // A new question answers the previous one with "no"
        pendingRef.current && pendingRef.current.resolve(false)
        pendingRef.current = { options, resolve }
        setPending(pendingRef.current)
        setOpen(true)
      }),
    []
  )

  const finish = (confirmed: boolean) => {
    if (pendingRef.current) {
      pendingRef.current.resolve(confirmed)
      pendingRef.current = null
    }
    // The options stay in the state, so the dialog keeps its content while it fades out
    setOpen(false)
  }

  const handleConfirm = () => {
    const result = pending.options.onConfirm && pending.options.onConfirm()

    if (isPromise(result)) {
      return result.then(() => finish(true))
    }

    finish(true)
  }

  const { content, onConfirm, ...dialogProps } = (pending && pending.options) || ({} as ConfirmOptions)

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <ConfirmDialog {...dialogProps} open={open} onConfirm={handleConfirm} onCancel={() => finish(false)}>
          {content}
        </ConfirmDialog>
      )}
    </ConfirmContext.Provider>
  )
}

/**
 * Returns a `confirm` function that opens a `ConfirmDialog` and resolves to `true` when the user confirms and
 * `false` when they cancel. Needs a `ConfirmDialogProvider` above it.
 *
 * @example
 * const confirm = useConfirm()
 * const remove = async () => {
 *   if (await confirm({ title: 'Delete this order?', confirmLabel: 'Delete', kind: 'danger' })) {
 *     deleteOrder()
 *   }
 * }
 */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext)

  if (!confirm) {
    throw new Error('useConfirm must be used inside a ConfirmDialogProvider')
  }

  return confirm
}
