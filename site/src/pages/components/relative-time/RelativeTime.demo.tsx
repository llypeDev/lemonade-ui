import { Flow, RelativeTime, Text } from '@lemonade/ui'
import React from 'react'

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000)

function RelativeTimeDemo() {
  return (
    <Flow direction='vertical' gap={0.5}>
      <Text>
        Edited <RelativeTime date={minutesAgo(5)} />
      </Text>
      <Text>
        Commented <RelativeTime date={minutesAgo(3 * 60)} />
      </Text>
      <Text>
        Created <RelativeTime date={minutesAgo(26 * 60)} />
      </Text>
      <Text>
        Expires <RelativeTime date={minutesAgo(-3 * 24 * 60)} />
      </Text>
      <Text>
        Short: <RelativeTime date={minutesAgo(3 * 60)} format='short' />
      </Text>
    </Flow>
  )
}

export default RelativeTimeDemo
