import React from 'react'

import { Card } from '../Card'
import { Grid, Cell } from '../Grid'

import { Stat } from './Stat'

export default {
  title: 'Components/Stat',
  component: Stat,
}

export const Default = () => (
  <Stat label='Revenue' value='R$ 12.430' change={12.5} description='vs last month' style={{ maxWidth: '16rem' }} />
)

export const Dashboard = () => (
  <Grid style={{ maxWidth: '60rem' }}>
    <Cell xs={12} md={3}>
      <Card>
        <Stat icon='walletOutline' label='Revenue' value='R$ 12.430' change={12.5} description='vs last month' />
      </Card>
    </Cell>
    <Cell xs={12} md={3}>
      <Card>
        <Stat icon='shoppingCartOutline' label='Orders' value='1.042' change={-3.2} description='vs last month' />
      </Card>
    </Cell>
    <Cell xs={12} md={3}>
      <Card>
        <Stat
          icon='exclamationTriangleOutline'
          label='Failed payments'
          value='18'
          change={-25}
          lowerIsBetter
          description='vs last month'
        />
      </Card>
    </Cell>
    <Cell xs={12} md={3}>
      <Card>
        <Stat icon='userOutline' label='New customers' value='318' change={0} description='vs last month' />
      </Card>
    </Cell>
  </Grid>
)
