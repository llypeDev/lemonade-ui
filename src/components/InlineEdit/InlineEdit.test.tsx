import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { InlineEdit } from './InlineEdit'

jest.mock('../../util/string')

const renderEdit = (props: Partial<React.ComponentProps<typeof InlineEdit>> = {}) =>
  render(
    <>
      <InlineEdit label='Project name' defaultValue='Lemonade website' {...props} />
      <button>Elsewhere</button>
    </>
  )

describe('InlineEdit', () => {
  it('should render correctly', () => {
    const { container } = renderEdit()
    expect(container).toMatchSnapshot()
  })

  it('should show the text in a button named after the label', () => {
    const { getByRole } = renderEdit()
    expect(getByRole('button', { name: 'Lemonade website , Edit Project name' })).toBeInTheDocument()
  })

  it('should open a field with the text selected', () => {
    const { getByRole } = renderEdit()

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    const input = getByRole('textbox', { name: 'Project name' }) as HTMLInputElement

    expect(input).toHaveValue('Lemonade website')
    expect(input).toHaveFocus()
    expect(input.selectionEnd - input.selectionStart).toBe('Lemonade website'.length)
  })

  it('should save with Enter and move the focus back to the text', () => {
    const onSave = jest.fn()
    const { getByRole } = renderEdit({ onSave })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'Lemonade docs' } })
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' })

    expect(onSave).toHaveBeenCalledWith('Lemonade docs')
    expect(getByRole('button', { name: /^Lemonade docs/ })).toHaveFocus()
  })

  it('should cancel with Escape', () => {
    const onSave = jest.fn()
    const { getByRole } = renderEdit({ onSave })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'Something else' } })
    fireEvent.keyDown(getByRole('textbox'), { key: 'Escape' })

    expect(onSave).not.toHaveBeenCalled()
    expect(getByRole('button', { name: /^Lemonade website/ })).toHaveFocus()
  })

  it('should save and cancel with the buttons', () => {
    const onSave = jest.fn()
    const { getByRole } = renderEdit({ onSave })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'Draft' } })
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(onSave).not.toHaveBeenCalled()

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'Final' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith('Final')
  })

  it('should save when the focus leaves the field', () => {
    const onSave = jest.fn()
    const { getByRole } = renderEdit({ onSave })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'Blurred' } })
    fireEvent.blur(getByRole('textbox'), { relatedTarget: getByRole('button', { name: 'Elsewhere' }) })

    expect(onSave).toHaveBeenCalledWith('Blurred')
  })

  it('should not save when nothing changed', () => {
    const onSave = jest.fn()
    const { getByRole } = renderEdit({ onSave })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' })
    expect(onSave).not.toHaveBeenCalled()
  })

  it('should keep the field open with the error of validate', () => {
    const onSave = jest.fn()
    const { getByRole } = renderEdit({ onSave, validate: (v) => (v.trim() ? undefined : 'Enter a name') })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: ' ' } })
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' })

    expect(onSave).not.toHaveBeenCalled()
    expect(getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(getByRole('alert')).toHaveTextContent('Enter a name')
  })

  it('should wait for an async save and stay open if it fails', async () => {
    let reject: () => void
    const onSave = jest.fn(() => new Promise<void>((_, fail) => (reject = fail)))
    const { getByRole } = renderEdit({ onSave })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'New name' } })
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' })
    expect(getByRole('textbox')).toHaveAttribute('readonly')
    expect(getByRole('textbox')).toHaveFocus()

    await act(async () => reject())
    expect(getByRole('textbox')).not.toHaveAttribute('readonly')
    expect(getByRole('textbox')).toHaveValue('New name')
    expect(getByRole('textbox')).toHaveFocus()
  })

  it('should move the focus back to the text after an async save', async () => {
    let resolve: () => void
    const onSave = jest.fn(() => new Promise<void>((done) => (resolve = done)))
    const { getByRole } = renderEdit({ onSave })

    fireEvent.click(getByRole('button', { name: /Edit Project name/ }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'New name' } })
    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' })

    await act(async () => resolve())
    expect(getByRole('button', { name: /^New name/ })).toHaveFocus()
  })

  it('should start with the field open with defaultEditing', () => {
    const { getByRole } = renderEdit({ defaultEditing: true })
    expect(getByRole('textbox', { name: 'Project name' })).toHaveValue('Lemonade website')
    expect(getByRole('textbox')).toHaveFocus()
  })

  it('should show the placeholder without a value', () => {
    const { getByRole } = renderEdit({ defaultValue: '', placeholder: 'Add a description' })
    expect(getByRole('button', { name: /^Add a description/ })).toBeInTheDocument()
  })
})
