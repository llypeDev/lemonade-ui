import { Flow, Highlight, List, ListItem, TextField } from '@lemonade/ui'
import React, { useState } from 'react'

const products = ['Coffee beans 1 kg', 'Paper filters', 'French press', 'Ceramic mug', 'Milk frother (manual)']

function HighlightDemo() {
  const [search, setSearch] = useState('coffee mug')
  const words = search.split(/\s+/)

  return (
    <Flow direction='vertical' gap={0.5} style={{ maxWidth: '24rem' }}>
      <TextField label='Search products' name='products' value={search} onChange={(e) => setSearch(e.target.value)} />
      <List>
        {products.map((product) => (
          <ListItem key={product} title={<Highlight text={product} words={words} />} />
        ))}
      </List>
    </Flow>
  )
}

export default HighlightDemo
