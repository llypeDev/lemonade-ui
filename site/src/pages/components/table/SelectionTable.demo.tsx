import { Button, DataTable, DataTableRowId } from '@lemonade/ui'
import React, { useState } from 'react'

interface Person {
  id: number
  name: string
  email: string
}

const allPeople: Person[] = [
  { id: 1, name: 'Maria Machado', email: 'maria@example.com' },
  { id: 2, name: 'José da Silva', email: 'jose@example.com' },
  { id: 3, name: 'Alice Barbosa', email: 'alice@example.com' },
  { id: 4, name: 'Carlos Lima', email: 'carlos@example.com' },
]

function SelectionTableDemo() {
  const [people, setPeople] = useState(allPeople)
  const [selected, setSelected] = useState<DataTableRowId[]>([2])

  return (
    <DataTable<Person>
      rows={people}
      columns={[
        { name: 'name', header: 'Name', render: (person) => person.name },
        { name: 'email', header: 'Email', render: (person) => person.email },
      ]}
      selectedRows={selected}
      onSelectedRowsChange={setSelected}
      getRowLabel={(person) => person.name}
      bulkActions={(selectedPeople) => (
        <Button
          size='small'
          kind='danger'
          onClick={() => {
            setPeople(people.filter((person) => !selectedPeople.includes(person)))
            setSelected([])
          }}
        >
          Remove
        </Button>
      )}
    />
  )
}

export default SelectionTableDemo
