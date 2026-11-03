import React, { memo, useEffect, useState } from 'react'

import { ButtonProps } from '../../Button'
import { Modal, ModalProps } from '../Modal'
import { ModalBody } from '../ModalBody'
import { ModalFooter } from '../ModalFooter'
import { HFlow } from '../../HFlow'
import { ModalFooterButton } from '../ModalFooterButton'
import { ModalHeader, ModalHeaderContentProps } from '../ModalHeader'

export type ButtonAction = ButtonProps & { label?: React.ReactNode; ['data-testid']?: string }

export interface ModalAutoProps
  extends Omit<ModalProps, 'open' | 'title'>,
    Omit<ModalHeaderContentProps, 'onCloseButtonClick'> {
  actions?: ButtonAction[]
  render(renderProps: ModalAutoRenderProps): React.ReactNode
  dispose(): void
  onClose?(): any
}

export interface ModalAutoState {
  open: boolean
}

export interface ModalAutoRenderProps {
  close(): void
}

export const ModalAuto = memo((props: ModalAutoProps) => {
  const { actions, title, subtitle, icon, hasCloseButton, render, dispose, onClose, onExited, ...rest } = props

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const close = () => {
    onClose && onClose()
    setIsOpen(false)
  }

  // Disposed only once the modal has faded out
  const handleExited = () => {
    onExited && onExited()
    dispose()
  }

  const getHandleAction = (actionClick: ButtonAction['onClick']) => (e: React.MouseEvent<HTMLButtonElement>) => {
    actionClick?.(e)
    close()
  }

  return (
    <Modal open={isOpen} onClose={close} onExited={handleExited} {...rest}>
      <ModalHeader title={title} subtitle={subtitle} icon={icon} hasCloseButton={hasCloseButton} />
      <ModalBody>{render({ close })}</ModalBody>
      {actions && (
        <ModalFooter>
          <HFlow justifyContent='flex-end'>
            {actions.map(({ label, onClick, ...action }, idx) => (
              <ModalFooterButton key={idx} onClick={getHandleAction(onClick)} {...action}>
                {label}
              </ModalFooterButton>
            ))}
          </HFlow>
        </ModalFooter>
      )}
    </Modal>
  )
})
