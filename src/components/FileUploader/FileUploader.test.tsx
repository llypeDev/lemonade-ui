import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'
import { focusRingStates } from '../../test/utils/resolveStyle'

import { FileUploader } from './FileUploader'

const testFile: File = new File([], 'teste.pdf', { type: 'application/pdf' })
const testFile2: File = new File([], 'teste.pdf', { type: '' })

it('should render correctly at initial state', () => {
  const { container } = render(<FileUploader />)
  expect(container).toMatchSnapshot()
})

it('should render correctly at uploading state', () => {
  const { container } = render(<FileUploader file={{ progress: 40, selectedFile: testFile, uploading: true }} />)
  expect(container).toMatchSnapshot()
})

it('should render correctly complete state', () => {
  const { container } = render(<FileUploader file={{ selectedFile: testFile }} />)
  expect(container).toMatchSnapshot()
})

it('should render correct without extension', () => {
  const { container } = render(<FileUploader file={{ selectedFile: testFile2 }} />)
  expect(container).toMatchSnapshot()
})

it('should be a button for screen readers', () => {
  const { getByRole, rerender } = render(<FileUploader />)
  const button = getByRole('button', { name: 'Click or drag files here to upload' })
  expect(button).toHaveAttribute('tabindex', '0')
  expect(button).not.toHaveAttribute('aria-disabled')

  rerender(<FileUploader disabled />)
  expect(getByRole('button', { name: 'Click or drag files here to upload' })).toHaveAttribute('aria-disabled', 'true')
})

it('should show the progress of a file that has no details yet', () => {
  const { getByRole } = render(<FileUploader file={{ uploading: true, progress: 30 }} />)
  expect(getByRole('progressbar')).toHaveAttribute('value', '30')
})

it('should take its default text from the locale strings', () => {
  const { getByText, rerender } = render(<FileUploader />)
  expect(getByText('Click or drag files here to upload')).toBeInTheDocument()

  rerender(
    <LocaleContext.Provider value={ptBR}>
      <FileUploader />
    </LocaleContext.Provider>
  )
  expect(getByText('Clique ou arraste arquivos para enviar')).toBeInTheDocument()
})

it('should list the files that were not added and why', async () => {
  const big = new File(['x'.repeat(2000)], 'big.pdf', { type: 'application/pdf' })
  const image = new File(['x'], 'photo.png', { type: 'image/png' })
  const { container, findByRole } = render(<FileUploader accept='application/pdf' maxSize={1000} multiple />)

  const input = container.querySelector('input')
  Object.defineProperty(input, 'files', { value: [big, image] })
  fireEvent.change(input)

  const alert = await findByRole('alert')
  expect(alert).toHaveTextContent('big.pdf · Not added: Larger than 1 KB')
  expect(alert).toHaveTextContent('photo.png · Not added: This type of file is not accepted')
})

it('should show the focus ring for the keyboard, not after a click', () => {
  const { getByRole } = render(<FileUploader />)
  const { received, expected } = focusRingStates(getByRole('button', { name: 'Click or drag files here to upload' }))
  expect(received).toEqual(expected)
})
