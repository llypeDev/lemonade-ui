import React from 'react'

import { Heading } from '../Heading'
import { Text } from '../Text'

import { TableOfContents } from './TableOfContents'

export default {
  title: 'Components/TableOfContents',
  component: TableOfContents,
}

const paragraph =
  'Orders move through four statuses: placed, paid, shipped and delivered. Each change is recorded in the history ' +
  'of the order, with the person who made it and the time. Customers get an email at each step.'

const sections = [
  { title: 'Overview', subsections: [] },
  { title: 'Statuses', subsections: ['Placed', 'Paid', 'Shipped'] },
  { title: 'Refunds', subsections: ['Partial refunds'] },
  { title: 'Questions', subsections: [] },
]

export const Default = () => (
  <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
    <article id='toc-article' style={{ flex: 1, maxWidth: '36rem' }}>
      {sections.map((section) => (
        <React.Fragment key={section.title}>
          <Heading level={2} style={{ marginTop: '1.5rem' }}>
            {section.title}
          </Heading>
          <Text component='p'>{paragraph}</Text>
          {section.subsections.map((subsection) => (
            <React.Fragment key={subsection}>
              <Heading level={3} style={{ marginTop: '1rem' }}>
                {subsection}
              </Heading>
              <Text component='p'>{paragraph}</Text>
              <Text component='p'>{paragraph}</Text>
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
      <div style={{ height: '50vh' }} />
    </article>
    <TableOfContents
      headings='#toc-article h2, #toc-article h3'
      style={{ position: 'sticky', top: '1rem', width: '12rem', flexShrink: 0 }}
    />
  </div>
)
