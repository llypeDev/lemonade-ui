import { Cell, Grid, Text, VFlow } from '@lemonade/ui'
import { useIntl } from 'gatsby-plugin-intl'
import React from 'react'

import { PageLayout } from '../components/PageLayout'

export default function Resources() {
  const intl = useIntl()

  return (
    <PageLayout>
      <VFlow>
        <h1>{intl.formatMessage({ id: 'resources-title' })}</h1>
        <Text component='p' fontSize={1}>
          {intl.formatMessage({ id: 'resources-description' })}
        </Text>

        <Grid>
          <Cell>
            <img width={96} src='/image/figma.svg' alt='Figma icon' />
          </Cell>
          <Cell>
            <VFlow vSpacing={0.5}>
              <div>
                <Text component='p' fontWeight='bold' fontSize={1}>
                  Lemonade Design Kit
                </Text>
                <Text component='p' fontSize={1}>
                  {intl.formatMessage({ id: 'resources-figma-description' })}
                </Text>
              </div>

              <Text component='p' fontSize={1}>
                {intl.formatMessage({ id: 'resources-figma-coming-soon' })}
              </Text>
            </VFlow>
          </Cell>
        </Grid>
      </VFlow>
    </PageLayout>
  )
}
