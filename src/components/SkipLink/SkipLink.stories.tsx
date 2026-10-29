import React from 'react'

import { Flow } from '../Flow'
import { Link } from '../Link'
import { Text } from '../Text'

import { SkipLink } from './SkipLink'

export default {
  title: 'Components/SkipLink',
  component: SkipLink,
}

export const Default = () => (
  <>
    <SkipLink />
    <Flow direction='vertical'>
      <Text component='p'>Press Tab to show the skip link, then Enter to jump to the content.</Text>
      <nav aria-label='Main'>
        <Flow direction='horizontal'>
          <Link href='#'>Home</Link>
          <Link href='#'>Orders</Link>
          <Link href='#'>Customers</Link>
          <Link href='#'>Reports</Link>
        </Flow>
      </nav>
      <main id='main'>
        <Text component='p'>Main content of the page.</Text>
      </main>
    </Flow>
  </>
)
