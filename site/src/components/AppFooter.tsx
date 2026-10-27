import { Cell, Grid, HFlow, Link, Text, Theme, useStyles } from '@lemonade/ui'
import React from 'react'

import { getYear } from 'date-fns'
import { PageContainer } from './PageContainer'

export function AppFooter() {
  const { classes } = useStyles(createStyles)
  const currentYear = getYear(new Date())

  return (
    <footer className={classes.footer}>
      <PageContainer>
        <Grid justifyContent='space-between'>
          <Cell xs={12} sm={6}>
            <Text component='p' fontWeight='bold' style={classes.brand}>
              Lemonade Design System
            </Text>
          </Cell>
          <Cell>
            <HFlow>
              <Link href='https://lemonade-ui.llypedev.com.br' target='_blank' style={{ display: 'inline-block' }}>
                lemonade-ui.llypedev.com.br
              </Link>
              <Link
                href='https://github.com/llypeDev/lemonade-ui'
                target='_blank'
                style={{ display: 'inline-block' }}
              >
                GitHub
              </Link>
            </HFlow>
          </Cell>
        </Grid>
        <hr />
        <p>Lemonade. {currentYear}.</p>
      </PageContainer>
    </footer>
  )
}

export const createStyles = (theme: Theme) => ({
  footer: {
    background: theme.pallete.surface.background,
    padding: '1.5rem 3rem',
  },
  brand: {
    fontSize: '1rem',
  } as React.CSSProperties,
})
