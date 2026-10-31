import { Combobox, Text, VFlow } from '@lemonade/ui'
import React, { useState } from 'react'

const dishes = ['Carbonara', 'Gnocchi', 'Lasagna', 'Macaroni and Cheese', 'Pesto', 'Pizza', 'Risotto']

function ComboboxDemo() {
  const [dish, setDish] = useState<string>(null)

  return (
    <VFlow style={{ maxWidth: '20rem' }}>
      <Combobox<string>
        label='Dish'
        name='dish'
        items={dishes}
        itemToString={(item) => item ?? ''}
        value={dish}
        onChange={setDish}
      />
      <Text color='secondary'>Picked: {dish ?? 'nothing yet'}</Text>
    </VFlow>
  )
}

export default ComboboxDemo
