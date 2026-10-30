import { CodeBlock, Flow } from '@lemonade/ui'
import React from 'react'

const response = `{
  "id": 1042,
  "status": "shipped",
  "customer": { "name": "Ana Souza", "email": "ana@example.com" },
  "total": 184.9
}`

function CodeBlockDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '36rem' }}>
      <CodeBlock language='bash' code='npm install @lemonade/ui --save' />
      <CodeBlock title='GET /orders/1042' language='json' code={response} showLineNumbers />
    </Flow>
  )
}

export default CodeBlockDemo
