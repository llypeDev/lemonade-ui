import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { Chip } from './Chip'
import { ChipGroup } from './ChipGroup'

describe('Chip', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ChipGroup aria-label='Status' defaultValue={['paid']}>
        <Chip value='paid' count={12}>
          Paid
        </Chip>
        <Chip value='shipped' icon='boxOutline'>
          Shipped
        </Chip>
      </ChipGroup>
    )
    expect(container).toMatchSnapshot()
  })

  it('should turn on and off by itself', () => {
    const onSelectedChange = jest.fn()
    const { getByRole } = render(<Chip onSelectedChange={onSelectedChange}>Paid</Chip>)
    const chip = getByRole('button', { name: 'Paid' })

    expect(chip).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)
  })

  it('should follow the selected prop of a controlled chip', () => {
    const onSelectedChange = jest.fn()
    const { getByRole } = render(
      <Chip selected={false} onSelectedChange={onSelectedChange}>
        Paid
      </Chip>
    )

    fireEvent.click(getByRole('button'))
    expect(onSelectedChange).toHaveBeenCalledWith(true)
    expect(getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show the count', () => {
    const { getByRole } = render(<Chip count={12}>Paid</Chip>)
    expect(getByRole('button')).toHaveTextContent('Paid12')
  })

  it('should show a check when selected, so the state does not rely on color', () => {
    const { container, getByRole } = render(<Chip icon='boxOutline'>Shipped</Chip>)
    const before = container.querySelector('svg').innerHTML

    fireEvent.click(getByRole('button'))
    expect(container.querySelector('svg').innerHTML).not.toBe(before)
  })
})

describe('ChipGroup', () => {
  it('should be a group with the selected values', () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ChipGroup aria-label='Status' defaultValue={['paid']} onChange={onChange}>
        <Chip value='paid'>Paid</Chip>
        <Chip value='shipped'>Shipped</Chip>
        <Chip value='canceled'>Canceled</Chip>
      </ChipGroup>
    )

    expect(getByRole('group', { name: 'Status' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Paid' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(getByRole('button', { name: 'Shipped' }))
    expect(onChange).toHaveBeenLastCalledWith(['paid', 'shipped'])
    expect(getByRole('button', { name: 'Shipped' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(getByRole('button', { name: 'Paid' }))
    expect(onChange).toHaveBeenLastCalledWith(['shipped'])
  })

  it('should follow the value of a controlled group', () => {
    const Controlled = () => {
      const [value, setValue] = useState<string[]>([])
      return (
        <>
          <ChipGroup aria-label='Status' value={value} onChange={setValue}>
            <Chip value='paid'>Paid</Chip>
            <Chip value='shipped'>Shipped</Chip>
          </ChipGroup>
          <button onClick={() => setValue([])}>Clear filters</button>
        </>
      )
    }
    const { getByRole } = render(<Controlled />)

    fireEvent.click(getByRole('button', { name: 'Paid' }))
    expect(getByRole('button', { name: 'Paid' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(getByRole('button', { name: 'Clear filters' }))
    expect(getByRole('button', { name: 'Paid' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('should keep a disabled chip off', () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ChipGroup aria-label='Status' onChange={onChange}>
        <Chip value='paid' disabled>
          Paid
        </Chip>
      </ChipGroup>
    )

    fireEvent.click(getByRole('button', { name: 'Paid' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
