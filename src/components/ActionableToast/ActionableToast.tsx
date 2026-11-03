import React, { CSSProperties, useRef, useEffect, useCallback, useContext, useState } from 'react'
import { Theme, useStyles } from '../../styles'
import { Tooltip } from '../Tooltip'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { useLocale } from '../../i18n'
import { moveFocusOut, useLeaving } from '../Toast/leaving'
import { animates } from '../Transition/animates'
import { leavingAttributes, leavingStyles } from '../Transition/leaving'

/**
 * @deprecated Use `ToastOptions` with `useToast` instead.
 */
export interface ActionableToastProps {
  id: number
  secondsVisible: number
  title?: string
  message: React.ReactNode
  buttonLabel?: React.ReactNode
  newToast?: boolean
  action?(): void
  onClose?(): void
  removeToast(id: number): void
}

interface ActionableToastListContextValue {
  // The element that had the focus before it entered the list
  originRef: React.MutableRefObject<HTMLElement | null>

  // The close button of each toast of the list, by the element of the toast
  closeButtons: Map<Element, HTMLElement>
}

/**
 * What the toasts of an `ActionableToastList` need to move the focus between them as they close
 */
export const ActionableToastListContext = React.createContext<ActionableToastListContextValue>(null)

// Length of the slide out of a toast that closes, before its space collapses, in milliseconds
const SLIDE_DURATION = 500

/**
 * @deprecated Use `Toast`, `ToastProvider` and `useToast` instead: they follow the toast design (bottom left,
 * informative icon, theme colors) and announce messages to screen readers.
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
export function ActionableToast(props: ActionableToastProps) {
  const {
    id,
    message,
    onClose = () => {},
    title,
    buttonLabel = 'Button',
    newToast,
    removeToast,
    action,
    secondsVisible,
  } = props

  const locale = useLocale()
  const timeoutRef = useRef<number>(null)
  const { classes, css } = useStyles(createStyles)
  const [isVisible, setIsVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const list = useContext(ActionableToastListContext)

  const itemRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  // Read by the timer and the event handlers, which can run before the next render
  const leavingRef = useRef(false)
  const hoveredRef = useRef(false)
  const focusedRef = useRef(false)

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // The latest removeToast, so a new function given on each render does not restart the timer
  const removeToastRef = useRef(removeToast)
  removeToastRef.current = removeToast

  // The close buttons of the toasts of the list, for the focus to go from toast to toast as they close
  useEffect(() => {
    const item = itemRef.current
    if (!list || !item) {
      return
    }

    list.closeButtons.set(item, closeButtonRef.current)
    return () => {
      list.closeButtons.delete(item)
    }
  }, [list])

  const leave = useCallback(() => {
    if (leavingRef.current) {
      return
    }

    leavingRef.current = true
    clearTimeout(timeoutRef.current)

    // Before it leaves the accessibility tree, the focus goes to the next toast still open, or the previous one,
    // or back to where it came from
    const item = itemRef.current
    const isOpen = (element: Element) => !element.hasAttribute('aria-hidden') && list.closeButtons.has(element)
    let next = list && item ? item.nextElementSibling : null
    while (next && !isOpen(next)) {
      next = next.nextElementSibling
    }
    let previous = list && item ? item.previousElementSibling : null
    while (previous && !isOpen(previous)) {
      previous = previous.previousElementSibling
    }
    moveFocusOut(item, [
      next && list.closeButtons.get(next),
      previous && list.closeButtons.get(previous),
      list && list.originRef.current,
    ])

    // It slides out, and then its space collapses; without motion, it leaves at once
    setIsVisible(false)
    if (animates()) {
      setLeaving(true)
    } else {
      removeToastRef.current(id)
    }
  }, [id, list])

  useLeaving(itemRef, leaving, SLIDE_DURATION, () => removeToastRef.current(id))

  // The time counts while the toast is neither hovered nor focused, until it closes
  const startTimer = useCallback(() => {
    // Leaving the toast more than once keeps a single timer
    clearTimeout(timeoutRef.current)
    if (!leavingRef.current && !hoveredRef.current && !focusedRef.current) {
      timeoutRef.current = setTimeout(leave, secondsVisible * 1000)
    }
  }, [leave, secondsVisible])

  useEffect(() => {
    if (!leavingRef.current) {
      setIsVisible(true)
    }
    startTimer()
    return () => clearTimer()
  }, [secondsVisible, id, startTimer])

  const handleCloseClick = () => {
    if (!leavingRef.current) {
      onClose()
      leave()
    }
  }

  const handleMouseEnter = () => {
    hoveredRef.current = true
    clearTimer()
  }

  const handleMouseLeave = () => {
    hoveredRef.current = false
    startTimer()
  }

  const handleFocus = () => {
    focusedRef.current = true
    clearTimer()
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
      ref={itemRef}
      className={css(classes.item, leaving && classes.leaving)}
      {...(leaving ? leavingAttributes : undefined)}
    >
      <div
        className={`${classes.container} ${isVisible ? 'visible' : 'hidden'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <div className={classes.headerWrapper}>
          {!!newToast && <div aria-hidden='true' className={classes.marker} />}
          <div className={classes.title}>
            <h5>{title}</h5>
          </div>
          <span className={classes.closeButtonWrapper}>
            <Tooltip text={locale.alert.close}>
              <Button
                innerRef={closeButtonRef}
                aria-label={locale.alert.close}
                size='small'
                skin='ghost'
                style={classes.closeButton}
                onClick={handleCloseClick}
              >
                <Icon icon='timesDefault' />
              </Button>
            </Tooltip>
          </span>
        </div>
        <div className={classes.toastMessage}>
          <h5>{message}</h5>
        </div>
        {!!action && (
          <div className={classes.actionButtonWrapper}>
            <Button style={classes.actionButton} size='small' onClick={action}>
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  item: {
    // Holds the margin of the toast, so the space of the toast collapses with it when it leaves
    display: 'flow-root',
  } as CSSProperties,
  leaving: leavingStyles,
  container: {
    borderRadius: '2px',
    border: '1px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    marginTop: '0.25rem',
    bottom: '1.25rem',
    minHeight: '5rem',
    minWidth: '16rem',
    backgroundColor: 'white',
    padding: '0 0.5rem 0.5rem 0',
    boxShadow: theme.shadows.outer[40],
    transition: 'transform 0.5s ease-in-out',
    transform: 'translateX(-100%)',
    [`&.visible`]: { transform: 'translateX(0%)' },
    [`&.hidden`]: { transform: 'translateX(100%)' },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  toastMessage: {
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'top',
    padding: '0 0 0.5rem 1rem',
  } as CSSProperties,
  closeButtonWrapper: {
    position: 'absolute',
    width: '1.5rem',
    height: '1.5rem',
    right: '1rem',
    top: '0.5rem',
  } as CSSProperties,
  closeButton: {
    padding: 0,
  } as CSSProperties,
  actionButtonWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  } as CSSProperties,
  actionButton: {
    border: `1 px solid ${theme.pallete.gray.c40}`,
    borderRadius: '0.25rem',
  } as CSSProperties,
  headerWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '0 0 0.25rem 1rem',
    marginTop: '1rem',
  } as CSSProperties,
  marker: {
    borderRadius: '50%',
    height: '0.5rem',
    width: '0.5rem',
    backgroundColor: theme.pallete.status.danger.c40,
    marginRight: '0.5rem',
  } as CSSProperties,
  title: {
    color: theme.pallete.primary.main,
  } as CSSProperties,
})
