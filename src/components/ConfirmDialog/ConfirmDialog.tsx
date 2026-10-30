import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { useLocale } from '../../i18n'
import { useStyles } from '../../styles'
import { isPromise } from '../../util'
import { randomStr } from '../../util/string'
import { Flow } from '../Flow'
import { Heading } from '../Heading'
import { Modal, ModalDepthLevel } from '../Modal/Modal'
import { ModalBody } from '../Modal/ModalBody'
import { ModalFooter } from '../Modal/ModalFooter'
import { ModalFooterButton } from '../Modal/ModalFooterButton'
import { ModalHeader } from '../Modal/ModalHeader'
import { ModalHeaderIcon, ModalHeaderIconType } from '../Modal/ModalHeaderIcon'
import { Text } from '../Text'

export type ConfirmDialogKind = 'primary' | 'danger'

export interface ConfirmDialogProps {
  open: boolean

  /**
   * Question the user answers, such as "Delete this order?"
   */
  title: React.ReactNode

  /**
   * What happens if the user confirms, such as "The order and its history will be deleted for good."
   */
  description?: React.ReactNode

  /**
   * Content below the description, such as a checkbox
   */
  children?: React.ReactNode

  /**
   * Label of the confirm button. Say what it does, such as "Delete order".
   * @default "Confirm", from the locale strings
   */
  confirmLabel?: React.ReactNode

  /**
   * @default "Cancel", from the locale strings
   */
  cancelLabel?: React.ReactNode

  /**
   * Use `danger` for actions that destroy data or cannot be undone
   * @default 'primary'
   */
  kind?: ConfirmDialogKind

  /**
   * Icon shown before the title
   */
  icon?: ModalHeaderIconType

  /**
   * Button that gets the focus when the dialog opens
   * @default 'cancel'
   */
  initialFocus?: 'cancel' | 'confirm'

  /**
   * Called by the confirm button. While a returned promise is pending, the button shows a spinner and the
   * dialog cannot be closed; if it rejects, the dialog stays open so the user can try again.
   */
  onConfirm(): void | Promise<unknown>

  /**
   * Called by the cancel button, the `Escape` key and a click on the backdrop
   */
  onCancel(): void

  /**
   * @default 1
   */
  depthLevel?: ModalDepthLevel
}

/**
 * Dialog that asks the user to confirm an action before it happens, such as deleting a record.
 * To open it from an event handler and wait for the answer, use `useConfirm`.
 */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    title,
    description,
    children,
    confirmLabel,
    cancelLabel,
    kind = 'primary',
    icon,
    initialFocus = 'cancel',
    onConfirm,
    onCancel,
    depthLevel = 1,
  } = props

  const locale = useLocale()
  const { classes } = useStyles(createStyles)
  const isMounted = useIsMounted()
  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const ids = useMemo(() => {
    const id = randomStr()
    return { title: `confirm-dialog-title-${id}`, description: `confirm-dialog-description-${id}` }
  }, [])

  // The safe choice gets the focus, so pressing Enter right away does not run the action
  useEffect(() => {
    if (open) {
      const button = initialFocus === 'confirm' ? confirmRef.current : cancelRef.current
      button && button.focus()
    }
  }, [open, initialFocus])

  const handleConfirm = () => {
    const result = onConfirm()

    if (isPromise(result)) {
      setConfirming(true)
      const done = () => isMounted.current && setConfirming(false)
      result.then(done, done)
    }
  }

  const handleCancel = () => {
    if (!confirming) {
      onCancel()
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      size='small'
      depthLevel={depthLevel}
      role='alertdialog'
      aria-labelledby={ids.title}
      aria-describedby={description ? ids.description : undefined}
      style={classes.dialog}
    >
      <ModalHeader hasCloseButton={false}>
        <Flow direction='horizontal' gap={1} alignItems='center'>
          {icon && <ModalHeaderIcon icon={icon} />}
          <Heading id={ids.title} level={1} color='normal' fontWeight='bold'>
            {title}
          </Heading>
        </Flow>
      </ModalHeader>

      {(description || children) && (
        <ModalBody style={classes.body}>
          <Flow direction='vertical'>
            {description && (
              <Text id={ids.description} component='p'>
                {description}
              </Text>
            )}
            {children}
          </Flow>
        </ModalBody>
      )}

      <ModalFooter>
        <Flow direction='horizontal' justifyContent='flex-end'>
          <ModalFooterButton innerRef={cancelRef} onClick={handleCancel} disabled={confirming}>
            {cancelLabel ?? locale.confirmDialog.cancel}
          </ModalFooterButton>
          <ModalFooterButton innerRef={confirmRef} kind={kind} loading={confirming} onClick={handleConfirm}>
            {confirmLabel ?? locale.confirmDialog.confirm}
          </ModalFooterButton>
        </Flow>
      </ModalFooter>
    </Modal>
  )
}

const createStyles = () => ({
  dialog: {
    maxWidth: '100%',
  } as CSSProperties,
  body: {
    // Keeps the description close to its question
    paddingTop: 0,
  } as CSSProperties,
})
