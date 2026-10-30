import { Checkbox, Fieldset } from '@lemonade/ui'
import React, { useState } from 'react'

const days = ['Monday', 'Wednesday', 'Friday']

function FieldsetErrorDemo() {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <Fieldset legend='Delivery days' required error={selected.length === 0 ? 'Pick at least one day' : undefined}>
      {days.map((day) => (
        <Checkbox
          key={day}
          label={day}
          checked={selected.includes(day)}
          onChange={(e) => setSelected(e.target.checked ? [...selected, day] : selected.filter((item) => item !== day))}
        />
      ))}
    </Fieldset>
  )
}

export default FieldsetErrorDemo
