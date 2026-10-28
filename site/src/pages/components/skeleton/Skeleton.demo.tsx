import { Flow, Skeleton } from '@lemonade/ui'
import React from 'react'

function SkeletonDemo() {
  return (
    <Flow direction='vertical' style={{ maxWidth: '24rem' }}>
      <Skeleton />
      <Skeleton lines={3} />
      <Skeleton variant='rectangle' height={120} />
      <Skeleton variant='circle' width={48} />
    </Flow>
  )
}

export default SkeletonDemo
