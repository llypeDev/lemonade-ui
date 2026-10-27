import React, { CSSProperties } from 'react'
import { useStyles } from '../../styles'
import { ActionableToast, ActionableToastProps } from './ActionableToast'

/**
 * @deprecated Use `ToastProviderProps` instead.
 */
export interface ActionableToastListProps {
  marginTop?: number
  marginRight?: string
  data: ActionableToastProps[]
}

/**
 * @deprecated Use `ToastProvider` and `useToast` instead, which render the toast list for you.
 *
 * @example
 * // Before
 * const { toastMessages, showToast } = useToastMessages()
 * <ActionableToastList data={toastMessages} />
 * showToast({ title: 'Saved', message: 'Your changes were saved.', secondsVisible: 5 })
 *
 * // After: wrap the app once with ToastProvider, then anywhere inside it
 * const toast = useToast()
 * toast.show({ title: 'Saved', message: 'Your changes were saved.', duration: 5000 })
 *
 * @deprecatedSince 1.5.0
 */
export function ActionableToastList(props: ActionableToastListProps) {
  const { data, marginTop = 1, marginRight = '1.5rem' } = props
  const { classes } = useStyles(() => createStyles(marginTop, marginRight))

  return (
    data.length > 0 && (
      <div className={classes.container}>
        {data.map((toast: ActionableToastProps) => (
          <ActionableToast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            title={toast.title}
            buttonLabel={toast.buttonLabel}
            onClose={toast.onClose}
            newToast={toast.newToast}
            action={toast.action}
            removeToast={toast.removeToast}
            secondsVisible={toast.secondsVisible}
          />
        ))}
      </div>
    )
  )
}

const createStyles = (marginTop: number, marginRight: string) => ({
  container: {
    position: 'fixed',
    padding: '0',
    paddingTop: '1rem',
    width: '100%',
    maxWidth: '17rem',
    maxHeight: '100vh',
    overflow: 'hidden',
    top: `${marginTop}rem`,
    right: marginRight,
    zIndex: 20,
  } as CSSProperties,
})
