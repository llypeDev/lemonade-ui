import { Button, colors, createTheme, HFlow, ThemeProvider } from '@lemonade/ui'
import React from 'react'

const myTheme = createTheme({
  pallete: {
    primaryScale: colors.pink,
  },
})

function CustomTheme() {
  return (
    <ThemeProvider theme={myTheme}>
      <HFlow>
        <Button kind='primary'>My custom theme!</Button>
      </HFlow>
    </ThemeProvider>
  )
}

export default CustomTheme
