import { Accordion, AccordionItem, Text } from '@lemonade/ui'
import React from 'react'

function AccordionDemo() {
  return (
    <Accordion>
      <AccordionItem title='What is Lemonade?' defaultExpanded>
        <Text>Lemonade is an open source design system with accessible and themeable React components.</Text>
      </AccordionItem>
      <AccordionItem title='How do I install it?'>
        <Text>Run yarn add @lemonade/ui and wrap your app with ThemeProvider.</Text>
      </AccordionItem>
      <AccordionItem title='Does it support dark mode?'>
        <Text>Yes. Use darkTheme with ThemeProvider and every component adapts.</Text>
      </AccordionItem>
      <AccordionItem title='Unavailable topic' disabled>
        <Text>Disabled items can't be expanded.</Text>
      </AccordionItem>
    </Accordion>
  )
}

export default AccordionDemo
