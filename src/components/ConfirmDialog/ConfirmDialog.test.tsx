import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Button } from '../Button'

import { ConfirmDialog } from './ConfirmDialog'
import { ConfirmDialogProvider, useConfirm } from './useConfirm'

jest.mock('../../util/string')

const renderDialog = (props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) =>
  render(
    <ConfirmDialog
      open
      title='Delete this order?'
      description='The order and its history will be deleted for good.'
      confirmLabel='Delete order'
      kind='danger'
      onConfirm={jest.fn()}
      onCancel={jest.fn()}
      {...props}
    />
  )

describe('ConfirmDialog', () => {
  it('should render correctly', () => {
    renderDialog()
    expect(document.body.querySelector('[role="alertdialog"]')).toMatchSnapshot()
  })

  it('should be an alert dialog named by its title and described by its description', () => {
    const { getByRole } = renderDialog()
    const dialog = getByRole('alertdialog', { name: 'Delete this order?' })

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(document.getElementById(dialog.getAttribute('aria-describedby'))).toHaveTextContent(
      'The order and its history will be deleted for good.'
    )
  })

  it('should focus the cancel button when it opens', () => {
    const { getByRole } = renderDialog()
    expect(getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('should focus the confirm button with initialFocus', () => {
    const { getByRole } = renderDialog({ initialFocus: 'confirm' })
    expect(getByRole('button', { name: 'Delete order' })).toHaveFocus()
  })

  it('should call onConfirm and onCancel', () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    const { getByRole } = renderDialog({ onConfirm, onCancel })

    fireEvent.click(getByRole('button', { name: 'Delete order' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should cancel with the Escape key', () => {
    const onCancel = jest.fn()
    renderDialog({ onCancel })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should use the labels from the locale by default', () => {
    const { getByRole } = renderDialog({ confirmLabel: undefined })
    expect(getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('should not close while the confirmation is pending', async () => {
    let finish: () => void
    const onConfirm = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    const onCancel = jest.fn()
    const { getByRole } = renderDialog({ onConfirm, onCancel })

    fireEvent.click(getByRole('button', { name: 'Delete order' }))
    expect(getByRole('button', { name: 'Cancel' })).toBeDisabled()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()

    await act(async () => finish())
    expect(getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
  })
})

describe('useConfirm', () => {
  const Demo = ({ onAnswer, onConfirm }: { onAnswer(answer: boolean): void; onConfirm?(): Promise<unknown> }) => {
    const confirm = useConfirm()
    const ask = async () =>
      onAnswer(await confirm({ title: 'Archive the project?', confirmLabel: 'Archive', onConfirm }))
    return <Button onClick={ask}>Archive</Button>
  }

  it('should resolve to true when the user confirms', async () => {
    const onAnswer = jest.fn()
    const { getByRole, findByRole } = render(
      <ConfirmDialogProvider>
        <Demo onAnswer={onAnswer} />
      </ConfirmDialogProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Archive' }))
    const dialog = await findByRole('alertdialog', { name: 'Archive the project?' })

    await act(async () => {
      fireEvent.click(dialog.querySelector('button:last-of-type'))
    })
    expect(onAnswer).toHaveBeenCalledWith(true)
  })

  it('should resolve to false when the user cancels', async () => {
    const onAnswer = jest.fn()
    const { getByRole, findByRole } = render(
      <ConfirmDialogProvider>
        <Demo onAnswer={onAnswer} />
      </ConfirmDialogProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Archive' }))
    await findByRole('alertdialog')

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Cancel' }))
    })
    expect(onAnswer).toHaveBeenCalledWith(false)
  })

  it('should wait for onConfirm before resolving', async () => {
    let finish: () => void
    const onConfirm = () => new Promise<void>((resolve) => (finish = resolve))
    const onAnswer = jest.fn()
    const { getByRole, findByRole } = render(
      <ConfirmDialogProvider>
        <Demo onAnswer={onAnswer} onConfirm={onConfirm} />
      </ConfirmDialogProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Archive' }))
    const dialog = await findByRole('alertdialog')

    fireEvent.click(dialog.querySelector('button:last-of-type'))
    expect(onAnswer).not.toHaveBeenCalled()

    await act(async () => finish())
    expect(onAnswer).toHaveBeenCalledWith(true)
  })

  it('should throw outside a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Demo onAnswer={jest.fn()} />)).toThrow(
      'useConfirm must be used inside a ConfirmDialogProvider'
    )
    spy.mockRestore()
  })
})
