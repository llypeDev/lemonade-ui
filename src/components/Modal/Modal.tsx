import FocusTrap from 'focus-trap-react'
import React, { Ref, useCallback, useMemo, useRef, useState } from 'react'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useOverlayEscape } from '../../hooks/useOverlayEscape'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { zIndexLevel } from '../../styles/theme/zIndex'
import { randomStr } from '../../util/string'
import { Portal } from '../Portal'
import { FadeTransition } from '../Transition/FadeTransition'
import { ModalContextValue, ModalContextProvider, ModalSectionsState } from '../../hooks/useModalContext'
import { ModalBackdrop } from './ModalBackdrop'
import { ModalContainer, ModalContainerProps } from './ModalContainer'

export type ModalSize = 'small' | 'medium' | 'large' | 'auto'
export type ModalDepthLevel = 1 | 2 | 3 | 4 | 5
export type ModalScroll = 'body' | 'full'

export interface ModalProps extends ModalContainerProps {
  open: boolean
  size?: ModalSize
  children?: React.ReactNode
  containerRef?: Ref<HTMLDivElement>
  onClose?(): void

  /**
   * Determine the container for scrolling the dialog
   * @default 'body'
   */
  scroll?: ModalScroll

  /**
   * Allows you to customize the depth of the container and the backdrop of the modal
   * @default 1 - the lowest possible value
   */
  depthLevel?: ModalDepthLevel

  /**
   * Allows you to remove the document's overflow property when a modal is closed
   * @default true
   */
  manageOverflow?: boolean

  /**
   * Specify whether the `onClose` prop should called when backdrop is clicked.
   * @default true
   */
  closeOnBackdropClick?: boolean

  /**
   * Styles applied to the element that wraps the modal (responsible for positioning, centering and
   * spacing). Useful, for example, to make the modal occupy the whole screen on mobile.
   */
  wrapperStyle?: ExternalStyles

  /**
   * Styles applied to the modal's backdrop.
   */
  backdropStyle?: ExternalStyles
}

export function Modal(props: ModalProps) {
  const {
    open,
    size,
    closeOnBackdropClick,
    children,
    containerRef,
    style,
    onClose,
    scroll = 'body',
    depthLevel,
    manageOverflow,
    wrapperStyle,
    backdropStyle,
    ...rest
  } = props

  const { classes, css } = useStyles(createStyles, depthLevel, scroll)
  const bodyRef = useRef()
  const modalRef = useRef<HTMLDivElement>(null)

  const [sectionsState, setSectionsState] = useState<ModalSectionsState>({
    hasHeader: false,
    hasLeftSidebar: false,
    hasRightSidebar: false,
  })

  const setSectionState = useCallback(
    (key: keyof ModalSectionsState, isPresent: boolean) => setSectionsState((prev) => ({ ...prev, [key]: isPresent })),
    []
  )

  // The title of a `ModalHeader` names the dialog
  const titleId = useMemo(() => `modal-title-${randomStr()}`, [])
  const [hasTitle, setHasTitle] = useState(false)

  const modalContextValue: ModalContextValue = useMemo(
    () => ({
      ...sectionsState,
      scroll,
      bodyRef,
      setSectionState,
      onClose,
      titleId,
      hasTitle,
      setHasTitle,
    }),
    [scroll, sectionsState, setSectionState, onClose, titleId, hasTitle]
  )

  // Kill body scroll when opened
  useBodyScrollLock(manageOverflow && open, classes.bodyWhenOpened)

  // Attach "Escape" to close modal, when no dialog or menu opened over it
  useOverlayEscape(open, () => onClose?.())

  return (
    <ModalContextProvider value={modalContextValue}>
      <FadeTransition in={open}>
        {({ className }) => (
          <>
            {open && (
              <Portal>
                <FocusTrap focusTrapOptions={{ fallbackFocus: () => modalRef.current, escapeDeactivates: false }}>
                  <div className={className}>
                    <div className={css(classes.modal, wrapperStyle)} ref={modalRef} tabIndex={-1}>
                      <ModalContainer ref={containerRef} style={css(classes[size], style)} {...rest}>
                        {children}
                      </ModalContainer>
                    </div>

                    <ModalBackdrop
                      depthLevel={depthLevel}
                      style={backdropStyle}
                      onClick={closeOnBackdropClick ? onClose : undefined}
                    />
                  </div>
                </FocusTrap>
              </Portal>
            )}
          </>
        )}
      </FadeTransition>
    </ModalContextProvider>
  )
}

Modal.defaultProps = {
  size: 'large',
  scroll: 'body',
  closeOnBackdropClick: true,
  depthLevel: 1,
  manageOverflow: true,
} as Partial<ModalProps>

const createStyles = (theme: Theme, depthLevel: number) => ({
  modal: {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: zIndexLevel[depthLevel].modalContainer,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    outline: 'none',
  } as React.CSSProperties,
  bodyWhenOpened: {
    overflow: 'hidden',
  },
  large: { width: 900 },
  medium: { width: 720 },
  small: { width: 520 },
  auto: { maxWidth: '100%' },
})
