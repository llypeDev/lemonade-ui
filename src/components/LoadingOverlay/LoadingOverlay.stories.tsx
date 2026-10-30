import React, { useEffect, useState } from 'react'

import { Button } from '../Button'
import { Card } from '../Card'
import { DescriptionList } from '../DescriptionList'
import { Flow } from '../Flow'

import { LoadingOverlay } from './LoadingOverlay'

export default {
  title: 'Components/LoadingOverlay',
  component: LoadingOverlay,
}

const Details = () => (
  <Card>
    <DescriptionList
      items={[
        { term: 'Order', description: '#1042' },
        { term: 'Customer', description: 'Ana Souza' },
        { term: 'Total', description: 'R$ 184,90' },
      ]}
    />
  </Card>
)

export const Loading = () => (
  <div style={{ maxWidth: '28rem' }}>
    <LoadingOverlay loading label='Loading the order'>
      <Details />
    </LoadingOverlay>
  </div>
)

export const Interactive = () => {
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
        Reload
      </Button>
      <LoadingOverlay loading={loading}>
        <Details />
      </LoadingOverlay>
    </Flow>
  )
}

Interactive.parameters = {
  loki: { skip: true },
}
