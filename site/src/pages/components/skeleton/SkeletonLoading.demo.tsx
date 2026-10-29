import { Avatar, Button, Flow, Skeleton, Text } from '@lemonade/ui'
import React, { useEffect, useState } from 'react'

function SkeletonLoadingDemo() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [loading])

  return (
    <Flow direction='vertical'>
      {/* aria-busy tells screen readers the region is still loading */}
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
      <Button size='small' onClick={() => setLoading(true)} disabled={loading} style={{ justifySelf: 'start' }}>
        Load again
      </Button>
    </Flow>
  )
}

export default SkeletonLoadingDemo
