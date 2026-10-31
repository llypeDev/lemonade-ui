import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../../i18n'
import ptBR from '../../../i18n/locales/pt-BR'

import { DataTable, DataTableProps, DataTableRowId } from './DataTable'

jest.mock('../../../util/string')

interface Person {
  id: number
  name: string
}

const people: Person[] = [
  { id: 1, name: 'Maria' },
  { id: 2, name: 'José' },
  { id: 3, name: 'Alice' },
]

const columns = [{ name: 'name', header: 'Name', render: (row: Person) => row.name }]

const Selectable = (props: Partial<DataTableProps<Person>> & { initial?: DataTableRowId[] }) => {
  const { initial = [], onSelectedRowsChange, ...rest } = props
  const [selected, setSelected] = useState<DataTableRowId[]>(initial)
  return (
    <DataTable<Person>
      rows={people}
      columns={columns}
      selectedRows={selected}
      onSelectedRowsChange={(ids) => {
        setSelected(ids)
        onSelectedRowsChange && onSelectedRowsChange(ids)
      }}
      getRowLabel={(row) => row.name}
      {...rest}
    />
  )
}

describe('DataTable selection', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Selectable initial={[2]} bulkActions={() => <button>Delete</button>} getRowLabel={undefined} />
    )
    expect(container).toMatchSnapshot()
  })

  it('should not show checkboxes without onSelectedRowsChange', () => {
    const { queryByRole } = render(<DataTable rows={people} columns={columns} />)
    expect(queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('should select and unselect a row', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Selectable onSelectedRowsChange={onChange} />)

    fireEvent.click(getByRole('checkbox', { name: 'Select José' }))
    expect(onChange).toHaveBeenLastCalledWith([2])
    expect(getByRole('checkbox', { name: 'Select José' })).toBeChecked()

    fireEvent.click(getByRole('checkbox', { name: 'Select José' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('should select all rows, and show a partial selection in the header', () => {
    const { getByRole } = render(<Selectable initial={[1]} />)
    const all = getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement

    expect(all.indeterminate).toBe(true)
    expect(all).not.toBeChecked()

    fireEvent.click(all)
    expect(all).toBeChecked()
    expect(all.indeterminate).toBe(false)
    expect(getByRole('checkbox', { name: 'Select Alice' })).toBeChecked()

    fireEvent.click(all)
    expect(getByRole('checkbox', { name: 'Select Alice' })).not.toBeChecked()
  })

  it('should keep the selected rows of other pages when selecting all', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Selectable initial={[99]} onSelectedRowsChange={onChange} />)

    fireEvent.click(getByRole('checkbox', { name: 'Select all rows' }))
    expect(onChange).toHaveBeenLastCalledWith([99, 1, 2, 3])

    fireEvent.click(getByRole('checkbox', { name: 'Select all rows' }))
    expect(onChange).toHaveBeenLastCalledWith([99])
  })

  it('should not call onRowClick when a checkbox is clicked', () => {
    const onRowClick = jest.fn()
    const { getByRole, getByText } = render(<Selectable onRowClick={onRowClick} />)

    fireEvent.click(getByRole('checkbox', { name: 'Select Maria' }))
    expect(onRowClick).not.toHaveBeenCalled()

    fireEvent.click(getByText('Maria'))
    expect(onRowClick).toHaveBeenCalledWith(people[0])
  })

  it('should name the checkboxes by the row number by default', () => {
    const { getByRole } = render(<Selectable getRowLabel={undefined} />)
    expect(getByRole('checkbox', { name: 'Select row 3' })).toBeInTheDocument()
  })

  it('should accept another row id', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Selectable getRowId={(row) => row.name} onSelectedRowsChange={onChange} />)

    fireEvent.click(getByRole('checkbox', { name: 'Select Alice' }))
    expect(onChange).toHaveBeenLastCalledWith(['Alice'])
  })

  it('should show the bulk actions while rows are selected and clear the selection', () => {
    const bulkActions = jest.fn((rows: Person[]) => <button>Delete {rows.length}</button>)
    const { getByRole, queryByRole } = render(<Selectable bulkActions={bulkActions} />)
    expect(queryByRole('region')).not.toBeInTheDocument()

    fireEvent.click(getByRole('checkbox', { name: 'Select Maria' }))
    fireEvent.click(getByRole('checkbox', { name: 'Select Alice' }))

    const bar = getByRole('region', { name: 'Actions for the selected rows' })
    expect(bar).toHaveTextContent('2 rows selected')
    expect(getByRole('button', { name: 'Delete 2' })).toBeInTheDocument()
    expect(bulkActions).toHaveBeenLastCalledWith([people[0], people[2]], [1, 3])
    expect(getByRole('status')).toHaveTextContent('2 rows selected')

    fireEvent.click(getByRole('button', { name: 'Clear selection' }))
    expect(queryByRole('region')).not.toBeInTheDocument()
    expect(getByRole('checkbox', { name: 'Select all rows' })).toHaveFocus()
    expect(getByRole('status')).toBeEmptyDOMElement()
  })

  it('should move the focus to the checkbox that selects all when an action clears the selection', () => {
    const Removable = () => {
      const [rows, setRows] = useState(people)
      const [selected, setSelected] = useState<DataTableRowId[]>([1])
      return (
        <DataTable<Person>
          rows={rows}
          columns={columns}
          selectedRows={selected}
          onSelectedRowsChange={setSelected}
          bulkActions={(selectedRows) => (
            <button
              onClick={() => {
                setRows(rows.filter((row) => !selectedRows.includes(row)))
                setSelected([])
              }}
            >
              Remove
            </button>
          )}
        />
      )
    }
    const { getByRole } = render(<Removable />)
    const remove = getByRole('button', { name: 'Remove' })

    remove.focus()
    fireEvent.click(remove)
    expect(getByRole('checkbox', { name: 'Select all rows' })).toHaveFocus()
  })

  it('should say when one row is selected', () => {
    const { getByRole } = render(<Selectable initial={[1]} bulkActions={() => null} />)
    expect(getByRole('region')).toHaveTextContent('1 row selected')
  })

  it('should disable the header checkbox without rows', () => {
    const { getByRole } = render(<Selectable rows={[]} />)
    expect(getByRole('checkbox', { name: 'Select all rows' })).toBeDisabled()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Selectable initial={[1, 2]} bulkActions={() => null} getRowLabel={undefined} />
      </LocaleContext.Provider>
    )
    expect(getByRole('checkbox', { name: 'Selecionar todas as linhas' })).toBeInTheDocument()
    expect(getByRole('checkbox', { name: 'Selecionar linha 1' })).toBeInTheDocument()
    expect(getByRole('region')).toHaveTextContent('2 linhas selecionadas')
    expect(getByRole('button', { name: 'Limpar seleção' })).toBeInTheDocument()
  })
})
