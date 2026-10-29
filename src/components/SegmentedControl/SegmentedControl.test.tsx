import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { SegmentedControl, SegmentedControlOption } from './SegmentedControl'

jest.mock('../../util/string')

const options: SegmentedControlOption[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'map', label: 'Map', disabled: true },
]

describe('SegmentedControl', () => {
  it('should render correctly', () => {
    const { container } = render(<SegmentedControl aria-label='View' options={options} />)
    expect(container).toMatchSnapshot()
  })

  it('should be a named radio group with one radio per option', () => {
    const { getByRole, getAllByRole } = render(<SegmentedControl aria-label='View' options={options} />)

    expect(getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    expect(getAllByRole('radio')).toHaveLength(3)
  })

  it('should select the first enabled option by default', () => {
    const { getByRole } = render(
      <SegmentedControl aria-label='View' options={[{ ...options[2] }, options[0], options[1]]} />
    )
    expect(getByRole('radio', { name: 'List' })).toBeChecked()
  })

  it('should change the selection and call onChange', () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <SegmentedControl aria-label='View' options={options} defaultValue='list' onChange={onChange} />
    )

    fireEvent.click(getByRole('radio', { name: 'Grid' }))

    expect(getByRole('radio', { name: 'Grid' })).toBeChecked()
    expect(getByRole('radio', { name: 'List' })).not.toBeChecked()
    expect(onChange).toHaveBeenCalledWith('grid')
  })

  it('should follow a controlled value', () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <SegmentedControl aria-label='View' options={options} value='list' onChange={onChange} />
    )

    fireEvent.click(getByRole('radio', { name: 'Grid' }))

    expect(onChange).toHaveBeenCalledWith('grid')
    expect(getByRole('radio', { name: 'List' })).toBeChecked()
  })

  it('should disable options and the whole control', () => {
    const { getByRole, getAllByRole, rerender } = render(<SegmentedControl aria-label='View' options={options} />)
    expect(getByRole('radio', { name: 'Map' })).toBeDisabled()

    rerender(<SegmentedControl aria-label='View' options={options} disabled />)
    getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled())
  })

  it('should share one name between the radios', () => {
    const { getAllByRole } = render(<SegmentedControl aria-label='View' options={options} name='view' />)
    getAllByRole('radio').forEach((radio) => expect(radio).toHaveAttribute('name', 'view'))
  })
})
