import { CodeBlock, Flow } from '@lemonade/ui'
import React from 'react'

const command = 'curl -X POST https://api.example.com/v1/orders -H "Authorization: Bearer <token>" -d @order.json'

function CodeBlockWrapDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '28rem' }}>
      <CodeBlock language='bash' code={command} />
      <CodeBlock language='bash' code={command} wrap />
    </Flow>
  )
}

export default CodeBlockWrapDemo
