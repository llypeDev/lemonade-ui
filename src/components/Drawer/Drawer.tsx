import { keyframes } from 'emotion'
import FocusTrap from 'focus-trap-react'
import React, { CSSProperties, useEffect, useMemo, useRef } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { zIndexLevel } from '../../styles/theme/zIndex'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { Button } from '../Button'
import { Heading } from '../Heading'
import { Icon } from '../Icon'
import { ModalBackdrop } from '../Modal/ModalBackdrop'
import { ModalDepthLevel } from '../Modal/Modal'
import { Portal } from '../Portal'
import { Tooltip } from '../Tooltip'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'title'> {
  open: boolean

  /**
   * Called by the close button, the `Escape` key and a click on the backdrop
   */
  onClose?(): void

  /**
   * Edge of the screen the drawer comes from
   * @default 'right'
   */
  placement?: DrawerPlacement

  /**
   * Width of a left or right drawer, or height of a top or bottom one, as a CSS value or pixels.
   * It never goes beyond the screen.
   * @default '25rem' for left and right, 'auto' for top and bottom
   */
  size?: number | string

  /**
   * Heading of the drawer, which also names it for screen readers.
   * Without it, name the drawer with `aria-label`.
   */
  title?: React.ReactNode

  /**
   * Content fixed at the bottom of the drawer, usually its actions
   */
  footer?: React.ReactNode

  /**
   * @default true
   */
  hasCloseButton?: boolean

  /**
   * Specify whether the `onClose` prop should be called when the backdrop is clicked
   * @default true
   */
  closeOnBackdropClick?: boolean

  /**
   * Removes the page scroll while the drawer is open
   * @default true
   */
  manageOverflow?: boolean

  /**
   * Depth of the drawer and its backdrop, shared with `Modal`
   * @default 1
   */
  depthLevel?: ModalDepthLevel

  style?: ExternalStyles
  backdropStyle?: ExternalStyles
}

/**
 * Panel that slides in from an edge of the screen over the page, for secondary content such as filters,
 * details or navigation. Like a `Modal`, it traps the focus while open.
 */
export function Drawer(props: DrawerProps) {
  const {
    open,
    onClose,
    placement = 'right',
    size,
    title,
    footer,
    hasCloseButton = true,
    closeOnBackdropClick = true,
    manageOverflow = true,
    depthLevel = 1,
    style,
    backdropStyle,
    children,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, placement, depthLevel)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useMemo(() => `drawer-title-${randomStr()}`, [])

  useEffect(() => {
    if (manageOverflow && open) {
      document.body.classList.add(classes.bodyWhenOpened)
      return () => document.body.classList.remove(classes.bodyWhenOpened)
    }
  }, [open, manageOverflow, classes.bodyWhenOpened])

  // The panel gets the first focus, so screen readers announce the drawer by its name
  // and opening it does not pop up the close button tooltip
  useEffect(() => {
    if (open) {
      panelRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  const isHorizontal = placement === 'left' || placement === 'right'
  const sizeStyle = isHorizontal ? { width: size ?? '25rem' } : { height: size ?? 'auto' }

  return (
    <Portal>
      <FocusTrap focusTrapOptions={{ fallbackFocus: () => panelRef.current }}>
        <div>
          <div
            ref={panelRef}
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={css(classes.drawer, sizeStyle, style)}
            {...rest}
          >
            {(title || hasCloseButton) && (
              <div className={classes.header}>
                <div className={classes.title}>
                  {title && (
                    <Heading id={titleId} level={2} fontWeight='bold' style={classes.heading}>
                      {title}
                    </Heading>
                  )}
                </div>
                {hasCloseButton && (
                  <Tooltip text={locale.modal.close}>
                    <Button aria-label={locale.modal.close} size='small' skin='ghost' onClick={onClose}>
                      <Icon icon='timesDefault' />
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}

            <div className={classes.body}>{children}</div>

            {footer && <div className={classes.footer}>{footer}</div>}
          </div>

          <ModalBackdrop
            depthLevel={depthLevel}
            style={backdropStyle}
            onClick={closeOnBackdropClick ? onClose : undefined}
          />
        </div>
      </FocusTrap>
    </Portal>
  )
}

const slideFrom = (transform: string) => keyframes({ from: { transform }, to: { transform: 'none' } })

const enterAnimations: Record<DrawerPlacement, string> = {
  left: slideFrom('translateX(-100%)'),
  right: slideFrom('translateX(100%)'),
  top: slideFrom('translateY(-100%)'),
  bottom: slideFrom('translateY(100%)'),
}

const placementStyles: Record<DrawerPlacement, CSSProperties> = {
  left: { top: 0, bottom: 0, left: 0, maxWidth: '100vw', borderRightWidth: 1 },
  right: { top: 0, bottom: 0, right: 0, maxWidth: '100vw', borderLeftWidth: 1 },
  top: { top: 0, left: 0, right: 0, maxHeight: '100vh', borderBottomWidth: 1 },
  bottom: { bottom: 0, left: 0, right: 0, maxHeight: '100vh', borderTopWidth: 1 },
}

const createStyles = (theme: Theme, placement: DrawerPlacement, depthLevel: number) => ({
  drawer: {
    ...theme.typography.variant('main'),
    position: 'fixed',
    zIndex: zIndexLevel[depthLevel].modalContainer,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    background: theme.pallete.surface.main,
    borderColor: theme.pallete.divider,
    borderStyle: 'solid',
    borderWidth: 0,
    boxShadow: theme.shadows.outer[160],
    outline: 'none',
    animation: `${enterAnimations[placement]} .2s ease-out`,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
    ...placementStyles[placement],
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.5rem',
    padding: '1rem 1rem 0.5rem 1.5rem',
  } as CSSProperties,
  title: {
    flex: 1,
  } as CSSProperties,
  heading: {
    // As tall as the close button, so a one line title is centered with it
    lineHeight: '2rem',
  } as CSSProperties,
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0.5rem 1.5rem 1.5rem',
  } as CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  bodyWhenOpened: {
    overflow: 'hidden',
  },
})
