import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'

export type AppHeaderPosition = 'static' | 'sticky' | 'fixed'

export interface AppHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * Logo or name of the product, usually a link to the home page
   */
  logo?: React.ReactNode

  /**
   * Content after the logo, such as a search field or the main links
   */
  children?: React.ReactNode

  /**
   * Content on the right, such as notifications, settings and the user menu
   */
  actions?: React.ReactNode

  /**
   * Shows a menu button before the logo, which should open the navigation, such as a `SideNav` in a `Drawer`
   */
  onMenuClick?(): void

  /**
   * Whether the navigation opened by the menu button is open, which changes the icon and the name of the button
   * @default false
   */
  menuOpen?: boolean

  /**
   * Id of the element the menu button opens
   */
  menuControls?: string

  /**
   * `mobile` shows the menu button only below the `md` breakpoint, where the navigation is usually hidden
   * @default 'mobile'
   */
  menuButton?: 'mobile' | 'always'

  /**
   * `sticky` keeps the header on the top of the page as it scrolls, inside its parent; `fixed` takes it out of
   * the page flow, so the page needs a top padding as tall as the header
   * @default 'static'
   */
  position?: AppHeaderPosition

  style?: ExternalStyles
}

// Under poppers, drawers and modals, but over the content of the page
const appHeaderZIndex = 1000

/**
 * Bar on the top of an application, with the logo, the main actions and the menu button that opens the
 * navigation on small screens.
 */
export function AppHeader(props: AppHeaderProps) {
  const {
    logo,
    children,
    actions,
    onMenuClick,
    menuOpen = false,
    menuControls,
    menuButton = 'mobile',
    position = 'static',
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, position)
  const menuLabel = menuOpen ? locale.appHeader.closeMenu : locale.appHeader.openMenu

  return (
    <header className={css(classes.header, style)} {...rest}>
      {onMenuClick && (
        <div className={css(classes.menuButton, menuButton === 'mobile' && classes.mobileOnly)}>
          <Tooltip text={menuLabel}>
            <Button
              size='small'
              skin='ghost'
              aria-label={menuLabel}
              aria-expanded={menuOpen}
              aria-controls={menuControls}
              onClick={onMenuClick}
            >
              <Icon icon={menuOpen ? 'timesDefault' : 'hamburguerMenu'} aria-hidden='true' />
            </Button>
          </Tooltip>
        </div>
      )}
      {logo && <div className={classes.logo}>{logo}</div>}
      {children && <div className={classes.content}>{children}</div>}
      {actions && <div className={classes.actions}>{actions}</div>}
    </header>
  )
}

const positionStyles: Record<AppHeaderPosition, CSSProperties> = {
  static: {},
  sticky: { position: 'sticky', top: 0, zIndex: appHeaderZIndex },
  fixed: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: appHeaderZIndex },
}

const createStyles = (theme: Theme, position: AppHeaderPosition) => ({
  header: {
    ...theme.typography.variant('main'),
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxSizing: 'border-box',
    minHeight: '4rem',
    padding: '0.75rem 1.5rem',
    background: theme.pallete.surface.main,
    borderBottom: `1px solid ${theme.pallete.divider}`,
    ...positionStyles[position],
    [theme.breakpoints.down('md')]: {
      padding: '0.75rem 1rem',
      gap: '0.5rem',
    },
  } as CSSProperties,
  menuButton: {
    display: 'flex',
    flexShrink: 0,
  } as CSSProperties,
  mobileOnly: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  } as CSSProperties,
  logo: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 0,
  } as CSSProperties,
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
    marginLeft: 'auto',
  } as CSSProperties,
})
