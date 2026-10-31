import { useCallback, useState } from 'react'

export interface UseDisclosureResult {
  open: boolean
  setOpen(open: boolean): void
  onOpen(): void
  onClose(): void
  onToggle(): void
}

/**
 * Keeps whether something is open, such as a modal, a drawer or a popover, with stable functions to open, close
 * and toggle it.
 *
 * @example
 * const { open, onOpen, onClose } = useDisclosure()
 * <Button onClick={onOpen}>Edit</Button>
 * <Modal open={open} onClose={onClose}>…</Modal>
 */
export function useDisclosure(initialOpen = false): UseDisclosureResult {
  const [open, setOpen] = useState(initialOpen)

  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])
  const onToggle = useCallback(() => setOpen((value) => !value), [])

  return { open, setOpen, onOpen, onClose, onToggle }
}
