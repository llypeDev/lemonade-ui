import React, { CSSProperties, useEffect, useLayoutEffect, useRef } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Button } from '../Button'
import { Icon, IconImage } from '../Icon'
import { Tooltip } from '../Tooltip'

export type BannerType = 'info' | 'success' | 'alert' | 'danger'

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  /**
   * @default 'info'
   */
  type?: BannerType

  /**
   * Short heading of the announcement, in bold before the text
   */
  title?: React.ReactNode

  /**
   * Buttons or links after the text, such as "Update payment"
   */
  actions?: React.ReactNode

  /**
   * Shows a close button that calls this function
   */
  onClose?(): void

  /**
   * Icon before the text
   * @default the icon of the type
   */
  icon?: IconImage

  /**
   * Element that takes the focus when the banner leaves the page while it has the focus, such as after its close
   * button: a ref, or a function that returns the element
   * @default the element that had the focus before the banner, else the first one after where the banner was, else
   * the last one before it
   */
  returnFocus?: React.RefObject<HTMLElement> | (() => HTMLElement | null)

  children?: React.ReactNode
  style?: ExternalStyles
}

const icons: Record<BannerType, IconImage> = {
  info: 'infoCircleFilled',
  success: 'checkCircleFilled',
  alert: 'exclamationTriangleFilled',
  danger: 'banOutline',
}

// The layout effect does nothing in server rendering, and React warns about it there
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Elements reached with Tab, in the order of the page
const tabbables = () =>
  Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')).filter(
    (element) => element.tabIndex >= 0 && !(element as HTMLButtonElement).disabled
  )

// Whether a node comes after another one, and is not inside it
const follows = (node: Node, other: Node) =>
  !!(other.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) && !other.contains(node)

// Focuses the first element that takes the focus, skipping those that cannot, such as hidden ones
const focusFirst = (elements: HTMLElement[], options?: FocusOptions) =>
  elements.some((element) => {
    element && document.contains(element) && element.focus(options)
    return !!element && document.activeElement === element
  })

// A container that cannot take the focus takes it until it loses it
const focusContainer = (container: HTMLElement) => {
  if (!container.hasAttribute('tabindex')) {
    container.setAttribute('tabindex', '-1')
    container.addEventListener('blur', () => container.removeAttribute('tabindex'), { once: true })
  }
  container.focus()
}

/**
 * Announcement across the top of the page, above the `AppHeader`, about the whole application, such as a
 * maintenance or a plan about to expire. For a message about part of the page, use an `Alert`.
 */
export function Banner(props: BannerProps) {
  const { type = 'info', title, actions, onClose, icon, returnFocus, onFocus, children, style, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, type)
  const rootRef = useRef<HTMLDivElement>(null)
  const originRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef(returnFocus)
  returnFocusRef.current = returnFocus

  // Keeps the element that had the focus when it came into the banner, such as the field the user was in before
  // a click on the close button
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const from = e.relatedTarget as HTMLElement
    if (!rootRef.current.contains(from)) {
      // Coming from the page itself is the same as from nowhere
      originRef.current = from === document.body || from === document.documentElement ? null : from
    }
    onFocus && onFocus(e)
  }

  // When the banner leaves the page with the focus in it, such as after its close button, the focus would go to the
  // page. Once the page has taken the banner out, and unless the application moved the focus, it goes to
  // `returnFocus`, else back to where it was before the banner, else to the first element after where the banner was,
  // such as one the page shows in its place, else to the last one before it, else to the container of the banner.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current
    return () => {
      if (!root.contains(document.activeElement)) {
        return
      }
      const parent = root.parentElement
      const previous = root.previousSibling
      const origin = originRef.current
      const target = returnFocusRef.current

      Promise.resolve().then(() => {
        const active = document.activeElement
        const chosen = typeof target === 'function' ? target() : target && target.current
        if (
          (active && active !== document.body) ||
          focusFirst([chosen]) ||
          // Without scrolling, as the user may have scrolled away from it, such as before clicking the close button
          focusFirst([origin], { preventScroll: true }) ||
          !document.contains(parent)
        ) {
          return
        }
        // Where the banner was: after the node before it, else at the start of its parent
        const after = (element: HTMLElement) =>
          previous && document.contains(previous)
            ? follows(element, previous)
            : parent.contains(element) || follows(element, parent)
        const nearby = tabbables()
        const focused = focusFirst([...nearby.filter(after), ...nearby.filter((element) => !after(element)).reverse()])
        !focused && parent !== document.body && focusContainer(parent)
      })
    }
  }, [])

  return (
    <div ref={rootRef} className={css(classes.banner, style)} onFocus={handleFocus} {...rest}>
      <Icon icon={icon ?? icons[type]} size={1.25} style={classes.icon} />
      <div className={classes.content}>
        <span className={classes.message}>
          {title && <strong className={classes.title}>{title}</strong>}
          {children}
        </span>
        {actions && <span className={classes.actions}>{actions}</span>}
      </div>
      {onClose && (
        <Tooltip text={locale.banner.close}>
          <Button size='small' skin='ghost' aria-label={locale.banner.close} onClick={onClose} style={classes.close}>
            <Icon icon='timesDefault' />
          </Button>
        </Tooltip>
      )}
    </div>
  )
}

const createStyles = (theme: Theme, type: BannerType) => {
  const status = theme.pallete.status[type]

  return {
    banner: {
      ...theme.typography.variant('main'),
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxSizing: 'border-box',
      width: '100%',
      minHeight: '3rem',
      padding: '0.5rem 1rem 0.5rem 1.5rem',
      background: status.background,
      borderBottom: `1px solid ${status.main}`,
      color: theme.pallete.text.main,
      [theme.breakpoints.down('md')]: {
        padding: '0.5rem 0.5rem 0.5rem 1rem',
      },
    } as CSSProperties,
    icon: {
      flexShrink: 0,
      fill: status.main,
    } as CSSProperties,
    content: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: '1rem',
      rowGap: '0.25rem',
      flex: 1,
      minWidth: 0,
    } as CSSProperties,
    message: {
      minWidth: 0,
    } as CSSProperties,
    title: {
      marginRight: '0.5rem',
    } as CSSProperties,
    actions: {
      display: 'inline-flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.5rem',
    } as CSSProperties,
    close: {
      flexShrink: 0,
      alignSelf: 'flex-start',
    } as CSSProperties,
  }
}
