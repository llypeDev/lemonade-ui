import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { FileList, FileListItem } from './FileList'

const files: FileListItem[] = [
  { id: '1', name: 'contract.pdf', size: 245000, status: 'done' },
  { id: '2', name: 'photo.jpg', size: 1800000, status: 'uploading', progress: 42 },
  { id: '3', name: 'notes.docx', size: 12000, status: 'error', error: 'The server did not answer' },
]

describe('FileList', () => {
  it('should render correctly', () => {
    const { container } = render(<FileList files={files} onRemove={jest.fn()} onRetry={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  it('should show the name, the size and the status of each file', () => {
    const { getAllByRole } = render(<FileList files={files} />)
    const items = getAllByRole('listitem')

    expect(items[0]).toHaveTextContent('contract.pdf245 KBUploaded')
    expect(items[1]).toHaveTextContent('photo.jpg2 MBUploading 42%')
    expect(items[1].querySelector('progress')).toHaveAttribute('value', '42')
    expect(items[2]).toHaveTextContent('Upload failed: The server did not answer')
  })

  it('should remove a file and retry a failed one', () => {
    const onRemove = jest.fn()
    const onRetry = jest.fn()
    const { getByRole, queryByRole } = render(<FileList files={files} onRemove={onRemove} onRetry={onRetry} />)

    fireEvent.click(getByRole('button', { name: 'Remove photo.jpg' }))
    expect(onRemove).toHaveBeenCalledWith('2')

    fireEvent.click(getByRole('button', { name: 'Try again: notes.docx' }))
    expect(onRetry).toHaveBeenCalledWith('3')
    expect(queryByRole('button', { name: 'Try again: contract.pdf' })).not.toBeInTheDocument()
  })

  it('should have no buttons without handlers and render nothing without files', () => {
    const { queryByRole, rerender, container } = render(<FileList files={files} />)
    expect(queryByRole('button')).not.toBeInTheDocument()

    rerender(<FileList files={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <FileList files={files} onRemove={jest.fn()} />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Remover contract.pdf' })).toBeInTheDocument()
  })
})
