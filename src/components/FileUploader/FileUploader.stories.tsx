import { action } from '@storybook/addon-actions'
import React, { useState } from 'react'

import { FileList, FileListItem } from './FileList'
import { FileUploader } from './FileUploader'

export default {
  title: 'Components/FileUploader',
  component: FileUploader,
}

export const Initial = () => (
  <FileUploader
    text='Click or drop file here'
    onDrop={action('onDrop')}
    onDropAccepted={action('onDropAccepted')}
    onDropRejected={action('onDropRejected')}
    onFileDialogCancel={action('onFileDialogCancel')}
    onDragOver={action('onDragOver')}
    onDragEnter={action('onDragEnter')}
    onDragLeave={action('onDragLeave')}
  />
)

export const Uploading = () => (
  <FileUploader
    text='Click or drop file here'
    file={{
      progress: 40,
      selectedFile: new File([], 'file_test.pdf', { type: 'text/pdf' }),
      uploading: true,
    }}
    onDrop={action('onDrop')}
    onDropAccepted={action('onDropAccepted')}
    onDropRejected={action('onDropRejected')}
    onFileDialogCancel={action('onFileDialogCancel')}
    onDragOver={action('onDragOver')}
    onDragEnter={action('onDragEnter')}
    onDragLeave={action('onDragLeave')}
  />
)

export const Completed = () => (
  <FileUploader
    text='Click or drop file here'
    file={{
      selectedFile: new File([], 'file_test.pdf', { type: 'text/pdf' }),
    }}
    onDrop={action('onDrop')}
    onDropAccepted={action('onDropAccepted')}
    onDropRejected={action('onDropRejected')}
    onFileDialogCancel={action('onFileDialogCancel')}
    onDragOver={action('onDragOver')}
    onDragEnter={action('onDragEnter')}
    onDragLeave={action('onDragLeave')}
  />
)

export const MultipleFiles = () => {
  const [files, setFiles] = useState<FileListItem[]>([
    { id: '1', name: 'contract.pdf', size: 245000, status: 'done' },
    { id: '2', name: 'photo.jpg', size: 1800000, status: 'uploading', progress: 42 },
    { id: '3', name: 'notes.docx', size: 12000, status: 'error', error: 'The server did not answer' },
  ])

  return (
    <div style={{ maxWidth: '32rem' }}>
      <FileUploader
        multiple
        accept='application/pdf,image/*'
        maxSize={5000000}
        onDropAccepted={(accepted) =>
          setFiles([
            ...files,
            ...accepted.map((file, index) => ({
              id: `${Date.now()}-${index}`,
              name: file.name,
              size: file.size,
              status: 'done' as const,
            })),
          ])
        }
      />
      <FileList
        files={files}
        onRemove={(id) => setFiles(files.filter((file) => file.id !== id))}
        onRetry={(id) =>
          setFiles(files.map((file) => (file.id === id ? { ...file, status: 'uploading', progress: 0 } : file)))
        }
      />
    </div>
  )
}
