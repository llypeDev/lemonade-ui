import React, { useState } from 'react'

import { Button } from '../Button'
import { Flow } from '../Flow'
import { Text } from '../Text'

import { RelativeTime } from './RelativeTime'

export default {
  title: 'Components/RelativeTime',
  component: RelativeTime,
}

// A fixed moment keeps the screenshots the same on every run
const now = new Date('2024-05-10T12:00:00Z')
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000)

const minute = 60
const hour = 60 * minute
const day = 24 * hour

export const Default = () => (
  <Flow direction='vertical' gap={0.5}>
    <Text>
      Saved <RelativeTime date={ago(10)} now={now} />
    </Text>
    <Text>
      Edited <RelativeTime date={ago(5 * minute)} now={now} />
    </Text>
    <Text>
      Commented <RelativeTime date={ago(2 * hour)} now={now} />
    </Text>
    <Text>
      Created <RelativeTime date={ago(day + 2 * hour)} now={now} />
    </Text>
    <Text>
      Expires <RelativeTime date={ago(-3 * day)} now={now} />
    </Text>
    <Text>
      Joined <RelativeTime date={ago(400 * day)} now={now} />
    </Text>
  </Flow>
)

export const Formats = () => (
  <Flow direction='vertical' gap={0.5}>
    <RelativeTime date={ago(2 * hour)} now={now} format='long' />
    <RelativeTime date={ago(2 * hour)} now={now} format='short' />
    <RelativeTime date={ago(2 * hour)} now={now} format='narrow' />
  </Flow>
)

export const Languages = () => (
  <Flow direction='vertical' gap={0.5}>
    <RelativeTime date={ago(2 * hour)} now={now} language='pt-BR' />
    <RelativeTime date={ago(-3 * day)} now={now} language='pt-BR' />
    <RelativeTime date={ago(day)} now={now} language='es' />
    <RelativeTime date={ago(day)} now={now} language='fr' />
  </Flow>
)

export const Live = () => {
  const [savedAt, setSavedAt] = useState(() => new Date())

  return (
    <Flow direction='horizontal' alignItems='center'>
      <Text>
        Saved <RelativeTime date={savedAt} />
      </Text>
      <Button size='small' onClick={() => setSavedAt(new Date())}>
        Save again
      </Button>
    </Flow>
  )
}

Live.parameters = {
  // The text changes with the time
  loki: { skip: true },
}
