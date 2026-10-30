import React, { CSSProperties } from 'react'

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

  children?: React.ReactNode
  style?: ExternalStyles
}

const icons: Record<BannerType, IconImage> = {
  info: 'infoCircleFilled',
  success: 'checkCircleFilled',
  alert: 'exclamationTriangleFilled',
  danger: 'banOutline',
}

/**
 * Announcement across the top of the page, above the `AppHeader`, about the whole application, such as a
 * maintenance or a plan about to expire. For a message about part of the page, use an `Alert`.
 */
export function Banner(props: BannerProps) {
  const { type = 'info', title, actions, onClose, icon, children, style, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, type)

  return (
    <div className={css(classes.banner, style)} {...rest}>
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
