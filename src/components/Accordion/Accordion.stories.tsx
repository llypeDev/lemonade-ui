import React, { useState } from 'react'

import { Button } from '../Button'
import { Text } from '../Text'
import { VFlow } from '../VFlow'

import { Accordion } from './Accordion'
import { AccordionItem } from './AccordionItem'

export default {
  title: 'Components/Accordion',
  component: AccordionItem,
}

export const Default = () => (
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

export const Controlled = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <VFlow>
      <Button size='small' onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Collapse' : 'Expand'} from outside
      </Button>
      <Accordion>
        <AccordionItem title='Controlled item' expanded={expanded} onChange={setExpanded}>
          <Text>The expanded state lives in the parent component.</Text>
        </AccordionItem>
      </Accordion>
    </VFlow>
  )
}
