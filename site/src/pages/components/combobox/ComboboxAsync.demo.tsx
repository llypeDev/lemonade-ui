import { Combobox, VFlow } from '@lemonade/ui'
import React, { useState } from 'react'

interface City {
  id: number
  name: string
}

const cities: City[] = [
  { id: 1, name: 'Belo Horizonte' },
  { id: 2, name: 'Brasília' },
  { id: 3, name: 'Curitiba' },
  { id: 4, name: 'Florianópolis' },
  { id: 5, name: 'Porto Alegre' },
  { id: 6, name: 'Recife' },
  { id: 7, name: 'Salvador' },
  { id: 8, name: 'São Paulo' },
]

// Stands for a search on a server
const searchCities = (query: string) =>
  new Promise<City[]>((resolve) =>
    setTimeout(
      () => resolve(cities.filter((city) => city.name.toLowerCase().includes((query || '').toLowerCase()))),
      400
    )
  )

function ComboboxAsyncDemo() {
  const [city, setCity] = useState<City>(null)

  return (
    <VFlow style={{ maxWidth: '20rem' }}>
      <Combobox<City>
        label='City'
        name='city'
        items={searchCities}
        itemToString={(item) => item?.name ?? ''}
        value={city}
        onChange={setCity}
      />
    </VFlow>
  )
}

export default ComboboxAsyncDemo
