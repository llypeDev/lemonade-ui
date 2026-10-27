import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { AlertType, createTypesStyles } from '../Alert/Alert'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'

export type ToastType = AlertType

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'style'> {
  /**
   * Defines the informative icon and its color
   * @default 'info'
   */
  type?: ToastType

  /**
   * Short title shown above the message
   */
  title?: React.ReactNode

  /**
   * A link or button that lets the user respond to the message
   */
  action?: React.ReactNode

  /**
   * Shows the dismiss button when set
   */
  onClose?(): void

  style?: ExternalStyles
}

/**
 * Event-driven message. To show toasts at the bottom left of the screen, with automatic closing,
 * use `ToastProvider` and the `useToast` hook.
 */
export function Toast(props: ToastProps) {
  const { type = 'info', title, action, onClose, style, children, ...rest } = props

  const locale = useLocale()
  const { classes, css, theme } = useStyles(createStyles)
  const typeStyle = createTypesStyles(theme)[type]

  return (
    <div className={css(classes.toast, style)} data-type={type} {...rest}>
      <Icon icon={typeStyle.icon} style={css(classes.icon, { color: typeStyle.style['color'] })} />
      <div className={classes.body}>
        {title && <p className={classes.title}>{title}</p>}
        <div>{children}</div>
        {action && <div className={classes.action}>{action}</div>}
      </div>
      {onClose && (
        <Tooltip text={locale.alert.close}>
          <Button aria-label={locale.alert.close} size='small' skin='ghost' style={classes.close} onClick={onClose}>
            <Icon icon='timesDefault' />
          </Button>
        </Tooltip>
      )}
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  toast: {
    ...theme.typography.variant('main'),
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'start',
    gap: '0.75rem',
    padding: '0.75rem 0.75rem 0.75rem 1rem',
    borderRadius: `${theme.radius.popper}px`,
    border: `1px solid ${theme.pallete.divider}`,
    background: theme.pallete.surface.main,
    boxShadow: theme.shadows.outer[40],
    color: theme.pallete.text.main,
  } as CSSProperties,
  icon: {
    // Aligns the 1.5rem icon with the first line of text
    marginTop: '-0.125rem',
  } as CSSProperties,
  body: {
    minWidth: 0,
    paddingTop: '0.125rem',
  } as CSSProperties,
  title: {
    margin: 0,
    fontWeight: 'bold',
  } as CSSProperties,
  action: {
    marginTop: '0.5rem',
  } as CSSProperties,
  close: {
    padding: 0,
    marginTop: '-0.125rem',
  } as CSSProperties,
})
