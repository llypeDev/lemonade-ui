import { render } from '@testing-library/react'
import React from 'react'

import { Fieldset } from './Fieldset'

jest.mock('../../util/string')

describe('Fieldset', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Fieldset legend='Shipping address' description='Where we deliver the order.' required>
        <input aria-label='Street' />
      </Fieldset>
    )
    expect(container).toMatchSnapshot()
  })

  it('should be a group named by its legend', () => {
    const { getByRole } = render(
      <Fieldset legend='Delivery days'>
        <input type='checkbox' aria-label='Monday' />
      </Fieldset>
    )
    expect(getByRole('group', { name: 'Delivery days' }).tagName).toBe('FIELDSET')
  })

  it('should describe the group with the description and the error', () => {
    const { getByRole } = render(
      <Fieldset legend='Delivery days' description='Pick the days someone is home.' error='Pick at least one day'>
        <input type='checkbox' aria-label='Monday' />
      </Fieldset>
    )
    const group = getByRole('group')
    const ids = group.getAttribute('aria-describedby').split(' ')

    expect(ids.map((id) => document.getElementById(id).textContent)).toEqual([
      'Pick the days someone is home.',
      'Pick at least one day',
    ])
    expect(getByRole('alert')).toHaveTextContent('Pick at least one day')
  })

  it('should disable every field inside it', () => {
    const { getByRole } = render(
      <Fieldset legend='Payment' disabled>
        <input aria-label='Card number' />
        <button>Pay</button>
      </Fieldset>
    )
    expect(getByRole('textbox', { name: 'Card number' })).toBeDisabled()
    expect(getByRole('button', { name: 'Pay' })).toBeDisabled()
  })
})
