import React from 'react'

import { Flow } from '../Flow'

import { CodeBlock } from './CodeBlock'

export default {
  title: 'Components/CodeBlock',
  component: CodeBlock,
}

const response = `{
  "id": 1042,
  "status": "shipped",
  "customer": { "name": "Ana Souza", "email": "ana@example.com" },
  "total": 184.9
}`

export const Default = () => (
  <Flow direction='vertical' style={{ maxWidth: '36rem' }}>
    <CodeBlock language='bash' code='npm install @lemonade/ui --save' />
    <CodeBlock title='GET /orders/1042' language='json' code={response} showLineNumbers />
  </Flow>
)

export const LongLines = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <CodeBlock
      language='text'
      code='curl -X POST https://api.example.com/v1/orders -H "Authorization: Bearer <token>" -d @order.json'
    />
    <CodeBlock
      language='text'
      wrap
      code='curl -X POST https://api.example.com/v1/orders -H "Authorization: Bearer <token>" -d @order.json'
    />
    <CodeBlock code={'LMN-4F7Q-92KD'} copyable={false} />
  </Flow>
)
