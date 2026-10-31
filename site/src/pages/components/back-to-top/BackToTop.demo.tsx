import { BackToTop, Text } from '@lemonade/ui'
import React from 'react'

function BackToTopDemo() {
  return (
    <>
      <Text>Scroll this page down: the button shows at the bottom right corner.</Text>
      <BackToTop threshold={300} />
    </>
  )
}

export default BackToTopDemo
