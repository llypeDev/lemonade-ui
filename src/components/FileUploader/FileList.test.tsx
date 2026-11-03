import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'
import { focusRingStates } from '../../test/utils/resolveStyle'

import { FileList, FileListItem } from './FileList'
import { FileUploader } from './FileUploader'

const files: FileListItem[] = [
  { id: '1', name: 'contract.pdf', size: 245000, status: 'done' },
  { id: '2', name: 'photo.jpg', size: 1800000, status: 'uploading', progress: 42 },
  { id: '3', name: 'notes.docx', size: 12000, status: 'error', error: 'The server did not answer' },
]

// Enter on a focused button clicks it, as in the browser
const pressEnter = (element: HTMLElement) => {
  element.focus()
  fireEvent.keyDown(element, { key: 'Enter' })
  fireEvent.click(element)
}

// An uploader with its list, as in the documentation, that removes and retries the files
const Uploads = (props: { files?: FileListItem[] }) => {
  const [list, setList] = useState(props.files ?? files)

  return (
    <>
      <FileUploader multiple />
      <FileList
        files={list}
        onRemove={(id) => setList(list.filter((file) => file.id !== id))}
        onRetry={(id) =>
          setList(list.map((file) => (file.id === id ? { ...file, status: 'uploading', progress: 0 } : file)))
        }
      />
    </>
  )
}

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
        <Uploads />
      </LocaleContext.Provider>
    )
    fireEvent.click(getByRole('button', { name: 'Remover contract.pdf' }))
    expect(getByRole('status')).toHaveTextContent('contract.pdf removido.')
  })
})

describe('FileList focus after removing', () => {
  it('should move the focus to the next file, else to the previous one', () => {
    const { getByRole } = render(<Uploads />)

    pressEnter(getByRole('button', { name: 'Remove photo.jpg' }))
    expect(getByRole('button', { name: 'Remove notes.docx' })).toHaveFocus()

    pressEnter(getByRole('button', { name: 'Remove notes.docx' }))
    expect(getByRole('button', { name: 'Remove contract.pdf' })).toHaveFocus()
  })

  it('should move the focus to the uploader after removing the last file', () => {
    const { getByRole } = render(<Uploads files={[files[0]]} />)

    pressEnter(getByRole('button', { name: 'Remove contract.pdf' }))
    expect(getByRole('button', { name: 'Click or drag files here to upload' })).toHaveFocus()
  })

  it('should keep the focus on the file after trying it again', () => {
    const { getByRole } = render(<Uploads />)

    pressEnter(getByRole('button', { name: 'Try again: notes.docx' }))
    expect(getByRole('button', { name: 'Remove notes.docx' })).toHaveFocus()
  })

  it('should wait for the application to remove the file', () => {
    let removeLater: () => void
    const Later = () => {
      const [list, setList] = useState(files)
      return (
        <FileList
          files={list}
          onRemove={(id) => {
            removeLater = () => setList(list.filter((file) => file.id !== id))
          }}
        />
      )
    }
    const { getByRole } = render(<Later />)
    const remove = getByRole('button', { name: 'Remove contract.pdf' })

    pressEnter(remove)
    expect(remove).toHaveFocus()
    act(() => removeLater())
    expect(getByRole('button', { name: 'Remove photo.jpg' })).toHaveFocus()
  })

  it('should leave the focus alone when the button did not have it', () => {
    const { getByRole } = render(<Uploads />)
    const uploader = getByRole('button', { name: 'Click or drag files here to upload' })

    // A click that does not focus the button, as in Safari
    uploader.focus()
    fireEvent.click(getByRole('button', { name: 'Remove photo.jpg' }))
    expect(uploader).toHaveFocus()
  })

  it('should announce the removed file', () => {
    const { getByRole } = render(<Uploads />)

    fireEvent.click(getByRole('button', { name: 'Remove photo.jpg' }))
    expect(getByRole('status')).toHaveTextContent('photo.jpg removed.')
  })
})

it('should show the focus ring of the buttons for the keyboard, not after a click', () => {
  const { getByRole } = render(<FileList files={files} onRemove={jest.fn()} onRetry={jest.fn()} />)

  ;[getByRole('button', { name: 'Remove photo.jpg' }), getByRole('button', { name: 'Try again: notes.docx' })].forEach(
    (button) => {
      const { received, expected } = focusRingStates(button)
      expect(received).toEqual(expected)
    }
  )
})
