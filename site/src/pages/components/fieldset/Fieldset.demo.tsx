import { Cell, Fieldset, Grid, TextField } from '@lemonade/ui'
import React from 'react'

function FieldsetDemo() {
  return (
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
}

export default FieldsetDemo
