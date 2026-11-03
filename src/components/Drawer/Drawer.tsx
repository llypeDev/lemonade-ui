import FocusTrap from 'focus-trap-react'
import React, { CSSProperties, useEffect, useMemo, useRef } from 'react'
import Transition, { TransitionStatus } from 'react-transition-group/Transition'

import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useOverlayEscape } from '../../hooks/useOverlayEscape'
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
import { animates } from '../Transition/animates'
import { leavingAttributes, leavingStyles } from '../Transition/leaving'
import { useReturnFocus } from '../Transition/useReturnFocus'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

// Length of the slide, in milliseconds
const DURATION = 200

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

  useBodyScrollLock(manageOverflow && open, classes.bodyWhenOpened)

  // The panel gets the first focus, so screen readers announce the drawer by its name
  // and opening it does not pop up the close button tooltip
  useEffect(() => {
    if (open) {
      panelRef.current?.focus()
    }
  }, [open])

  // Closes with Escape, unless a dialog or menu opened over it
  useOverlayEscape(open, () => onClose?.())

  // The drawer stays on the page while it slides out, but the focus goes back to the page as soon as it closes
  useReturnFocus(open)

  // Without motion, the drawer shows and leaves the page at once
  const motion = animates()

  // The panel is laid out out of the screen before it moves, so the browser slides it from there
  const handleEnter = () => panelRef.current?.getBoundingClientRect()

  const isHorizontal = placement === 'left' || placement === 'right'
  const sizeStyle = isHorizontal ? { width: size ?? '25rem' } : { height: size ?? 'auto' }

  return (
    <Transition
      in={open}
      nodeRef={panelRef}
      timeout={DURATION}
      appear={motion}
      enter={motion}
      exit={motion}
      onEnter={handleEnter}
    >
      {(state: TransitionStatus) =>
        (open || state !== 'exited') && (
          <Portal>
            <FocusTrap
              active={open}
              focusTrapOptions={{
                fallbackFocus: () => panelRef.current,
                escapeDeactivates: false,
                // Only when the drawer is removed while open: when it closes, useReturnFocus gives the focus back
                returnFocusOnDeactivate: open,
              }}
            >
              <div className={open ? undefined : classes.leaving} {...(open ? undefined : leavingAttributes)}>
                <div
                  ref={panelRef}
                  role='dialog'
                  aria-modal='true'
                  aria-labelledby={title ? titleId : undefined}
                  tabIndex={-1}
                  className={css(
                    classes.drawer,
                    isHidden(state) && classes.hidden,
                    state === 'exiting' && classes.exiting,
                    sizeStyle,
                    style
                  )}
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
                  style={[
                    classes.backdrop,
                    isHidden(state) && classes.backdropHidden,
                    state === 'exiting' && classes.backdropExiting,
                    backdropStyle,
                  ]}
                  onClick={open && closeOnBackdropClick ? onClose : undefined}
                />
              </div>
            </FocusTrap>
          </Portal>
        )
      }
    </Transition>
  )
}

// Before it slides in, and while it slides out, the panel is out of the screen and the backdrop is transparent
const isHidden = (state: TransitionStatus) => state === 'exited' || state === 'exiting'

const hiddenTransforms: Record<DrawerPlacement, string> = {
  left: 'translateX(-100%)',
  right: 'translateX(100%)',
  top: 'translateY(-100%)',
  bottom: 'translateY(100%)',
}

// The panel can be laid out out of the screen before it shows, such as by the focus trap looking for what it can
// focus, and it would slide from there
const noTransition: CSSProperties = {
  transition: 'none',
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
    transform: 'none',
    // It slows down at the end when it slides in, and speeds up when it slides out
    transition: `transform ${DURATION}ms ease-out`,
    '@media (prefers-reduced-motion: reduce)': noTransition,
    ...placementStyles[placement],
  } as CSSProperties,
  hidden: {
    transform: hiddenTransforms[placement],
  } as CSSProperties,
  exiting: {
    transition: `transform ${DURATION}ms ease-in`,
  } as CSSProperties,
  backdrop: {
    transition: `opacity ${DURATION}ms ease-out`,
    '@media (prefers-reduced-motion: reduce)': noTransition,
  } as CSSProperties,
  backdropHidden: {
    opacity: 0,
  } as CSSProperties,
  backdropExiting: {
    transition: `opacity ${DURATION}ms ease-in`,
  } as CSSProperties,
  leaving: leavingStyles,
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
