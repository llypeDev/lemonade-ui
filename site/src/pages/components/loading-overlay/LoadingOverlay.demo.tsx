import { Button, Card, DescriptionList, Flow, LoadingOverlay } from '@lemonade/ui'
import React, { useEffect, useState } from 'react'

function LoadingOverlayDemo() {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [loading])

  return (
    <Flow direction='vertical' style={{ maxWidth: '28rem' }}>
      <Button size='small' onClick={() => setLoading(true)} disabled={loading} style={{ justifySelf: 'start' }}>
        Reload the order
      </Button>
      <LoadingOverlay loading={loading} label='Loading the order'>
        <Card>
          <DescriptionList
            items={[
              { term: 'Order', description: '#1042' },
              { term: 'Customer', description: 'Ana Souza' },
              { term: 'Total', description: 'R$ 184,90' },
            ]}
          />
        </Card>
      </LoadingOverlay>
    </Flow>
  )
}

export default LoadingOverlayDemo
