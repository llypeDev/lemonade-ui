import React from 'react'

import { Checkbox } from '../Checkbox'
import { Grid, Cell } from '../Grid'
import { TextField } from '../TextField'

import { Fieldset } from './Fieldset'

export default {
  title: 'Components/Fieldset',
  component: Fieldset,
}

export const Address = () => (
  <Fieldset legend='Shipping address' description='Where we deliver the order.' style={{ maxWidth: '32rem' }}>
    <TextField label='Street' name='street' />
    <Grid>
      <Cell xs={8}>
        <TextField label='City' name='city' />
      </Cell>
      <Cell xs={4}>
        <TextField label='ZIP code' name='zip' />
      </Cell>
    </Grid>
  </Fieldset>
)

export const WithError = () => (
  <Fieldset legend='Delivery days' required error='Pick at least one day'>
    <Checkbox label='Monday' />
    <Checkbox label='Wednesday' />
    <Checkbox label='Friday' />
  </Fieldset>
)

export const Disabled = () => (
  <Fieldset legend='Payment' description='Paid with the card on file.' disabled style={{ maxWidth: '32rem' }}>
    <TextField label='Card number' defaultValue='•••• 4242' />
    <Checkbox label='Save the card for the next orders' defaultChecked />
  </Fieldset>
)
