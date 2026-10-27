import { Dispatch, SetStateAction, useState } from 'react'
import { ActionableToastProps } from '../components/ActionableToast'

/**
 * @deprecated Use `ToastOptions` instead.
 */
export interface ToastMessagesInterface {
  secondsVisible?: number
  newToast?: boolean
  title: string
  message: React.ReactNode
  buttonLabel?: React.ReactNode
  action?: () => void
  onClose?: () => void
}

/**
 * @deprecated Use `useToast` inside a `ToastProvider` instead.
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
export function useToastMessages(): {
  toastMessages: ActionableToastProps[]
  setToastMessages: Dispatch<SetStateAction<ActionableToastProps[]>>
  showToast: (variables: ToastMessagesInterface) => void
} {
  const [toastMessages, setToastMessages] = useState<ActionableToastProps[]>([])
  const removeToast = (id: number) => {
    setToastMessages((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  const showToast = (props: ToastMessagesInterface) => {
    const { message, newToast = false, title, buttonLabel, action, secondsVisible = 5, onClose } = props

    const toast = {
      id: Date.now(),
      message: message,
      action: action,
      title: title,
      newToast: newToast,
      buttonLabel: buttonLabel,
      removeToast,
      secondsVisible,
      onClose,
    }

    setToastMessages((prevToasts) => [...prevToasts, toast])
  }

  return { toastMessages, setToastMessages, showToast }
}
