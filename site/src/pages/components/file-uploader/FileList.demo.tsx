import { FileList, FileListItem, FileUploader } from '@lemonade/ui'
import React, { useEffect, useState } from 'react'

function FileListDemo() {
  const [files, setFiles] = useState<FileListItem[]>([
    { id: 'contract', name: 'contract.pdf', size: 245000, status: 'done' },
    { id: 'notes', name: 'notes.pdf', size: 12000, status: 'error', error: 'The server did not answer' },
  ])

  const uploading = files.some((file) => file.status === 'uploading')

  // Simulates the progress of the uploads
  useEffect(() => {
    if (!uploading) {
      return
    }
    const timer = setInterval(() => {
      setFiles((current) =>
        current.map((file) => {
          if (file.status !== 'uploading') {
            return file
          }
          const progress = Math.min(100, (file.progress || 0) + 15)
          return progress === 100 ? { ...file, status: 'done', progress } : { ...file, progress }
        })
      )
    }, 300)
    return () => clearInterval(timer)
  }, [uploading])

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
              status: 'uploading' as const,
              progress: 0,
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

export default FileListDemo
