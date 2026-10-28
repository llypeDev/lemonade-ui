import React, { useEffect, useState } from 'react'

import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { Flow } from '../Flow'
import { Text } from '../Text'

import { Skeleton } from './Skeleton'

export default {
  title: 'Components/Skeleton',
  component: Skeleton,
}

export const Variants = () => (
  <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
    <Skeleton />
    <Skeleton lines={3} />
    <Skeleton variant='rectangle' height={120} />
    <Skeleton variant='circle' width={48} />
  </Flow>
)

const ProfileCard = ({ loading }: { loading: boolean }) => (
  <Flow
    direction='horizontal'
    alignItems='flex-start'
    style={{ maxWidth: '24rem', gridTemplateColumns: 'auto 1fr' }}
    aria-busy={loading}
  >
    {loading ? <Skeleton variant='circle' /> : <Avatar name='Ana Souza' />}
    <div>
      {loading ? (
        <>
          <Skeleton width='40%' />
          <Skeleton lines={2} />
        </>
      ) : (
        <>
          <Text fontWeight='bold' component='p'>
            Ana Souza
          </Text>
          <Text component='p'>Product designer working on the Lemonade components and the docs site.</Text>
        </>
      )}
    </div>
  </Flow>
)

export const LoadingContent = () => <ProfileCard loading />

export const Interactive = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [loading])

  return (
    <Flow direction='vertical'>
      <ProfileCard loading={loading} />
      <Button size='small' onClick={() => setLoading(true)} disabled={loading}>
        Load again
      </Button>
    </Flow>
  )
}

Interactive.parameters = {
  loki: { skip: true },
}
