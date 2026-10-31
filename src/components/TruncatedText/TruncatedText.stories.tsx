import React from 'react'

import { Flow } from '../Flow'
import { Icon } from '../Icon'

import { TruncatedText } from './TruncatedText'

export default {
  title: 'Components/TruncatedText',
  component: TruncatedText,
}

const box = { width: '14rem', padding: '0.5rem', border: '1px solid #D3D4DD', borderRadius: 4 }

export const Default = () => (
  <Flow direction='vertical' gap={0.5}>
    <div style={box}>
      <TruncatedText>Annual report 2024 - final version reviewed by legal.pdf</TruncatedText>
    </div>
    <div style={box}>
      <TruncatedText>Invoice 0042.pdf</TruncatedText>
    </div>
    <div style={{ ...box, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Icon icon='fileEmptyOutline' style={{ flexShrink: 0 }} />
      <TruncatedText>Meeting notes from the planning of the third quarter.docx</TruncatedText>
    </div>
  </Flow>
)

export const Lines = () => (
  <div style={{ ...box, width: '18rem' }}>
    <TruncatedText lines={2} component='p' style={{ margin: 0 }}>
      The new orders page shows the status of each order, its items and the history of changes, so the support team can
      answer customers without opening other systems.
    </TruncatedText>
  </div>
)
