import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { TagInput, TagInputProps } from './TagInput'

jest.mock('../../util/string')

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value)

const Controlled = (props: Partial<TagInputProps>) => {
  const { onChange, defaultValue = [], ...rest } = props
  const [tags, setTags] = useState(defaultValue)
  return (
    <TagInput
      label='Recipients'
      value={tags}
      onChange={(next) => {
        setTags(next)
        onChange && onChange(next)
      }}
      {...rest}
    />
  )
}

const tagTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('button[aria-label^="Remove"]')).map((button) =>
    button.getAttribute('aria-label').replace('Remove ', '')
  )

describe('TagInput', () => {
  it('should render correctly', () => {
    const { container } = render(
      <TagInput
        label='Recipients'
        defaultValue={['ana@example.com', 'not an email']}
        validate={isEmail}
        placeholder='Add emails'
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should add the typed text with Enter and with a comma', () => {
    const onChange = jest.fn()
    const { container, getByRole } = render(<Controlled onChange={onChange} />)
    const input = getByRole('textbox', { name: 'Recipients' })

    fireEvent.change(input, { target: { value: ' ana@example.com ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenLastCalledWith(['ana@example.com'])
    expect(input).toHaveValue('')

    fireEvent.change(input, { target: { value: 'bia@example.com' } })
    fireEvent.keyDown(input, { key: ',' })
    expect(tagTexts(container)).toEqual(['ana@example.com', 'bia@example.com'])
    expect(getByRole('status')).toHaveTextContent('bia@example.com added.')
  })

  it('should leave Enter alone when there is no text, so the form can be sent', () => {
    const { getByRole } = render(<Controlled />)
    const input = getByRole('textbox')
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(true)
  })

  it('should remove the last tag with Backspace in an empty field', () => {
    const onChange = jest.fn()
    const { container, getByRole } = render(<Controlled defaultValue={['a', 'b']} onChange={onChange} />)
    const input = getByRole('textbox')

    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(tagTexts(container)).toEqual(['a'])
    expect(getByRole('status')).toHaveTextContent('b removed.')

    fireEvent.change(input, { target: { value: 'x' } })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(tagTexts(container)).toEqual(['a'])
  })

  it('should remove a tag with its button and keep the focus in the field', () => {
    const { container, getByRole } = render(<Controlled defaultValue={['a', 'b', 'c']} />)

    fireEvent.click(getByRole('button', { name: 'Remove b' }))
    expect(tagTexts(container)).toEqual(['a', 'c'])
    expect(getByRole('textbox')).toHaveFocus()
  })

  it('should split a pasted list', () => {
    const { container, getByRole } = render(<Controlled defaultValue={['a@x.com']} />)
    const input = getByRole('textbox')

    fireEvent.paste(input, { clipboardData: { getData: () => 'b@x.com, c@x.com;\nd@x.com\n\na@x.com' } })
    expect(tagTexts(container)).toEqual(['a@x.com', 'b@x.com', 'c@x.com', 'd@x.com'])
    expect(getByRole('status')).toHaveTextContent('b@x.com added. c@x.com added. d@x.com added.')
  })

  it('should not split a pasted single value', () => {
    const { container, getByRole } = render(<Controlled />)
    const event = fireEvent.paste(getByRole('textbox'), { clipboardData: { getData: () => 'one value' } })
    expect(event).toBe(true)
    expect(tagTexts(container)).toEqual([])
  })

  it('should add the text when the field loses the focus', () => {
    const { container, getByRole } = render(<Controlled />)
    const input = getByRole('textbox')

    fireEvent.change(input, { target: { value: 'design' } })
    fireEvent.blur(input)
    expect(tagTexts(container)).toEqual(['design'])
  })

  it('should skip repeated values unless they are allowed', () => {
    const { container, getByRole, rerender } = render(<TagInput label='Tags' defaultValue={['a']} />)
    const input = getByRole('textbox')

    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(tagTexts(container)).toEqual(['a'])

    rerender(<TagInput label='Tags' defaultValue={['a']} allowDuplicates />)
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(tagTexts(container)).toEqual(['a', 'a'])
  })

  it('should stop at the maximum', () => {
    const { container, getByRole } = render(<Controlled max={2} defaultValue={['a']} />)
    const input = getByRole('textbox')

    fireEvent.paste(input, { clipboardData: { getData: () => 'b,c,d' } })
    expect(tagTexts(container)).toEqual(['a', 'b'])
    expect(input).toHaveAttribute('readonly')
  })

  it('should mark values that fail the validation', () => {
    const { getByText, getByRole } = render(<TagInput label='Emails' defaultValue={['oops']} validate={isEmail} />)

    expect(getByText('oops').parentElement).toHaveTextContent('oops, not valid')
    expect(getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('should use custom separators', () => {
    const { container, getByRole } = render(<Controlled separators={[' ']} />)
    const input = getByRole('textbox')

    fireEvent.change(input, { target: { value: 'react' } })
    fireEvent.keyDown(input, { key: ' ' })
    expect(tagTexts(container)).toEqual(['react'])
  })

  it('should treat a dash separator as a character, not as a range', () => {
    const { container, getByRole } = render(<Controlled separators={[',', '-', ';']} />)

    // Unescaped, the separators would form the range ",-;", which includes the digits
    fireEvent.paste(getByRole('textbox'), { clipboardData: { getData: () => '123-456' } })
    expect(tagTexts(container)).toEqual(['123', '456'])
  })

  it('should explain the keys and show the error', () => {
    const { getByRole, getByText } = render(<TagInput label='Emails' error='Add at least one email' />)
    const input = getByRole('textbox')

    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent(
      'Press Enter or comma to add.'
    )
    expect(getByText('Add at least one email')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should have no remove buttons when disabled', () => {
    const { queryByRole, getByRole } = render(<TagInput label='Tags' defaultValue={['a']} disabled />)
    expect(queryByRole('button')).not.toBeInTheDocument()
    expect(getByRole('textbox')).toBeDisabled()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <TagInput label='Etiquetas' defaultValue={['a']} />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Remover a' })).toBeInTheDocument()
  })
})
