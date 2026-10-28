import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Drawer } from './Drawer'

jest.mock('../../util/string')

describe('Drawer', () => {
  it('should render correctly', () => {
    const { baseElement } = render(
      <Drawer open title='Filters' footer={<button>Apply</button>}>
        Content
      </Drawer>
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should render nothing when closed', () => {
    const { queryByRole } = render(<Drawer open={false}>Content</Drawer>)
    expect(queryByRole('dialog')).toBeNull()
  })

  it('should be a modal dialog named by its title', () => {
    const { getByRole } = render(
      <Drawer open title='Filters'>
        Content
      </Drawer>
    )
    const dialog = getByRole('dialog', { name: 'Filters' })

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('Content')
  })

  it('should move the focus to the panel when opened', () => {
    const { getByRole } = render(
      <Drawer open title='Filters'>
        <button>Inside</button>
      </Drawer>
    )
    expect(getByRole('dialog')).toHaveFocus()
  })

  it('should accept aria-label when there is no title', () => {
    const { getByRole } = render(
      <Drawer open aria-label='Menu'>
        Content
      </Drawer>
    )
    expect(getByRole('dialog', { name: 'Menu' })).not.toHaveAttribute('aria-labelledby')
  })

  it('should call onClose from the close button, Escape and the backdrop', () => {
    const onClose = jest.fn()
    const { getByRole, getByTestId } = render(
      <Drawer open title='Filters' onClose={onClose}>
        Content
      </Drawer>
    )

    fireEvent.click(getByRole('button', { name: 'Close' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(getByTestId('backdrop'))

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('should not close on backdrop click when closeOnBackdropClick is false', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(
      <Drawer open title='Filters' onClose={onClose} closeOnBackdropClick={false}>
        Content
      </Drawer>
    )

    fireEvent.click(getByTestId('backdrop'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should hide the close button when hasCloseButton is false', () => {
    const { queryByRole } = render(
      <Drawer open title='Filters' hasCloseButton={false}>
        Content
      </Drawer>
    )
    expect(queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('should remove the page scroll only while open', () => {
    const { rerender } = render(
      <Drawer open title='Filters'>
        Content
      </Drawer>
    )
    expect(document.body.classList.length).toBe(1)

    rerender(
      <Drawer open={false} title='Filters'>
        Content
      </Drawer>
    )
    expect(document.body.classList.length).toBe(0)
  })
})
