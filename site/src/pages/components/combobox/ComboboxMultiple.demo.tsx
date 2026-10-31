import { Combobox, VFlow } from '@lemonade/ui'
import React, { useState } from 'react'

const toppings = ['Basil', 'Mozzarella', 'Mushrooms', 'Olives', 'Onion', 'Pepperoni', 'Tomato']

function ComboboxMultipleDemo() {
  const [picked, setPicked] = useState<string[]>(['Mozzarella', 'Basil'])

  return (
    <VFlow style={{ maxWidth: '24rem' }}>
      <Combobox<string>
        multiple
        label='Toppings'
        name='toppings'
        items={toppings}
        itemToString={(item) => item ?? ''}
        itemIsEqual={(a, b) => a === b}
        value={picked}
        onChange={setPicked}
      />
    </VFlow>
  )
}

export default ComboboxMultipleDemo
