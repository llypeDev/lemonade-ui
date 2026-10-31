import { Flow, Icon, TruncatedText } from '@lemonade/ui'
import React from 'react'

const files = ['Annual report 2024 - final version reviewed by legal.pdf', 'Invoice 0042.pdf', 'Team photo.jpg']

function TruncatedTextDemo() {
  return (
    <Flow direction='vertical' gap={0.5} style={{ width: '16rem' }}>
      {files.map((file) => (
        <div key={file} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon icon='fileEmptyOutline' style={{ flexShrink: 0 }} />
          <TruncatedText>{file}</TruncatedText>
        </div>
      ))}
      <TruncatedText lines={2} component='p' style={{ margin: 0 }}>
        The new orders page shows the status of each order, its items and the history of changes, so the support team
        can answer customers without opening other systems.
      </TruncatedText>
    </Flow>
  )
}

export default TruncatedTextDemo
