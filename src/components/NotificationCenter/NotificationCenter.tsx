import { Placement } from '@popperjs/core'
import React, { CSSProperties, useMemo, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Icon, IconImage } from '../Icon'
import { Popover } from '../Popover'
import { RelativeTime } from '../RelativeTime'
import { VisuallyHidden } from '../VisuallyHidden'

export interface NotificationItem {
  id: string
  title: React.ReactNode

  /**
   * Second line, such as who did what
   */
  description?: React.ReactNode

  /**
   * When it happened, shown as a relative time, such as "5 minutes ago"
   */
  date: Date | number | string

  read?: boolean

  /**
   * Makes the notification a link, such as to the order it is about
   */
  href?: string

  icon?: IconImage
}

export interface NotificationCenterProps {
  notifications: NotificationItem[]

  /**
   * Called when the user opens a notification, which should then be marked as read
   */
  onNotificationClick?(notification: NotificationItem): void

  /**
   * Shows a "Mark all as read" button that calls this function
   */
  onMarkAllRead?(): void

  /**
   * Content at the bottom of the panel, such as a link to all the notifications
   */
  footer?: React.ReactNode

  /**
   * @default "Notifications", from the locale strings
   */
  title?: string

  /**
   * Where the panel opens
   * @default 'bottom-end'
   */
  placement?: Placement

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

/**
 * A bell with the number of unread notifications that opens a panel with the latest ones, such as in the header
 * of an application.
 */
export function NotificationCenter(props: NotificationCenterProps) {
  const { notifications, onNotificationClick, onMarkAllRead, footer, title, placement = 'bottom-end', style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [anchor, setAnchor] = useState<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const titleId = useMemo(() => `notification-center-${randomStr()}`, [])

  const unread = notifications.filter((notification) => !notification.read).length
  const label = title ?? locale.notificationCenter.label
  const unreadText = fill(locale.notificationCenter.unread, { count: unread })

  const renderContent = (notification: NotificationItem) => (
    <>
      <span className={css(classes.dot, notification.read && classes.dotRead)} aria-hidden />
      {notification.icon && <Icon icon={notification.icon} size={1.25} style={classes.icon} />}
      <span className={classes.text}>
        {!notification.read && <VisuallyHidden>{locale.notificationCenter.unreadItem}: </VisuallyHidden>}
        <span className={css(classes.title, !notification.read && classes.unread)}>{notification.title}</span>
        {notification.description && <span className={classes.description}>{notification.description}</span>}
        <RelativeTime date={notification.date} tooltip={false} style={classes.date} />
      </span>
    </>
  )

  return (
    <>
      <button
        ref={setAnchor}
        type='button'
        className={css(classes.bell, style)}
        aria-label={unread > 0 ? `${label}, ${unreadText}` : label}
        onClick={() => setOpen(!open)}
      >
        <Badge count={unread} max={9}>
          <Icon icon='bellOutline' size={1.5} />
        </Badge>
      </button>
      <Popover
        anchorRef={anchor}
        open={open}
        onClose={() => setOpen(false)}
        placement={placement}
        aria-labelledby={titleId}
        style={classes.panel}
      >
        <div className={classes.header}>
          <h2 id={titleId} className={classes.heading}>
            {label}
          </h2>
          {onMarkAllRead && (
            <Button size='small' skin='ghost' disabled={unread === 0} onClick={onMarkAllRead}>
              {locale.notificationCenter.markAllRead}
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className={classes.empty}>{locale.notificationCenter.empty}</p>
        ) : (
          <ul className={classes.list}>
            {notifications.map((notification) => (
              <li key={notification.id}>
                {notification.href ? (
                  <a
                    href={notification.href}
                    className={classes.item}
                    onClick={() => onNotificationClick && onNotificationClick(notification)}
                  >
                    {renderContent(notification)}
                  </a>
                ) : (
                  <button
                    type='button'
                    className={classes.item}
                    onClick={() => onNotificationClick && onNotificationClick(notification)}
                  >
                    {renderContent(notification)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {footer && <div className={classes.footer}>{footer}</div>}
      </Popover>
    </>
  )
}

const createStyles = (theme: Theme) => ({
  bell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: theme.radius.button,
    background: 'transparent',
    color: theme.pallete.text.main,
    cursor: 'pointer',
    outline: 'none',
    '&:hover, &[aria-expanded="true"]': {
      background: theme.pallete.surface.background,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  panel: {
    width: '24rem',
    padding: 0,
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.5rem 0.5rem 0.5rem 1rem',
    borderBottom: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  heading: {
    ...theme.typography.variant('h4'),
    margin: 0,
  } as CSSProperties,
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    maxHeight: '24rem',
    overflowY: 'auto',
    '& li + li': {
      borderTop: `1px solid ${theme.pallete.divider}`,
    },
  } as CSSProperties,
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    padding: '0.75rem 1rem',
    border: 0,
    background: 'transparent',
    color: theme.pallete.text.main,
    font: 'inherit',
    textAlign: 'left',
    textDecoration: 'none',
    cursor: 'pointer',
    outline: 'none',
    '&:hover': {
      background: theme.pallete.surface.background,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
  } as CSSProperties,
  dot: {
    flexShrink: 0,
    width: '0.5rem',
    height: '0.5rem',
    marginTop: '0.375rem',
    borderRadius: '50%',
    background: theme.pallete.primary.main,
  } as CSSProperties,
  dotRead: {
    background: 'transparent',
  } as CSSProperties,
  icon: {
    flexShrink: 0,
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  text: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  } as CSSProperties,
  title: {
    overflowWrap: 'anywhere',
  } as CSSProperties,
  unread: {
    fontWeight: 'bold',
  } as CSSProperties,
  description: {
    color: theme.pallete.text.secondary,
    overflowWrap: 'anywhere',
  } as CSSProperties,
  date: {
    marginTop: '0.25rem',
    color: theme.pallete.text.secondary,
    fontSize: '0.75rem',
  } as CSSProperties,
  empty: {
    margin: 0,
    padding: '2rem 1rem',
    textAlign: 'center',
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  footer: {
    padding: '0.5rem 1rem',
    borderTop: `1px solid ${theme.pallete.divider}`,
    textAlign: 'center',
  } as CSSProperties,
})
