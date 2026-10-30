import { Banner, Button } from '@lemonade/ui'
import React, { useState } from 'react'

function BannerClosableDemo() {
  const [open, setOpen] = useState(true)

  return open ? (
    <Banner onClose={() => setOpen(false)}>Welcome to the new Lemonade! Take a look at what changed.</Banner>
  ) : (
    <Button size='small' onClick={() => setOpen(true)}>
      Show the banner again
    </Button>
  )
}

export default BannerClosableDemo
