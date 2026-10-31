import React, { useState } from 'react'

import { Text } from '../Text'

import { TabItem } from './TabItem'
import { TabPanel } from './TabPanel'
import { Tabs } from './Tabs'

export default { title: 'Components/Tabs', component: Tabs }

export const Default = () => (
  <Tabs>
    <TabItem>First item</TabItem>
    <TabItem active>Second item</TabItem>
    <TabItem>Third item</TabItem>
    <TabItem>Fourth item</TabItem>
    <TabItem disabled>Disabled item</TabItem>
  </Tabs>
)

const sections = [
  { id: 'profile', label: 'Profile', content: 'Your name, photo and the languages you speak.' },
  { id: 'security', label: 'Security', content: 'Your password, two-step verification and active sessions.' },
  { id: 'notifications', label: 'Notifications', content: 'What we send you by email and on your phone.' },
  { id: 'billing', label: 'Billing', content: 'Your plan, payment cards and invoices.' },
]

export const Vertical = () => {
  const [active, setActive] = useState('security')

  return (
    <div style={{ display: 'flex', gap: '1.5rem', maxWidth: '40rem' }}>
      <Tabs orientation='vertical' aria-label='Settings' style={{ flexShrink: 0, width: '10rem' }}>
        {sections.map((section) => (
          <TabItem
            key={section.id}
            id={`tab-${section.id}`}
            aria-controls={`panel-${section.id}`}
            active={active === section.id}
            onClick={() => setActive(section.id)}
          >
            {section.label}
          </TabItem>
        ))}
        <TabItem disabled>Integrations</TabItem>
      </Tabs>
      {sections.map((section) => (
        <TabPanel
          key={section.id}
          id={`panel-${section.id}`}
          aria-labelledby={`tab-${section.id}`}
          active={active === section.id}
        >
          <Text component='p' style={{ margin: 0 }}>
            {section.content}
          </Text>
        </TabPanel>
      ))}
    </div>
  )
}

export const WithPanels = () => {
  const [active, setActive] = useState('profile')

  return (
    <div style={{ maxWidth: '40rem' }}>
      <Tabs aria-label='Settings'>
        {sections.map((section) => (
          <TabItem
            key={section.id}
            id={`tab-h-${section.id}`}
            aria-controls={`panel-h-${section.id}`}
            active={active === section.id}
            onClick={() => setActive(section.id)}
          >
            {section.label}
          </TabItem>
        ))}
      </Tabs>
      {sections.map((section) => (
        <TabPanel
          key={section.id}
          id={`panel-h-${section.id}`}
          aria-labelledby={`tab-h-${section.id}`}
          active={active === section.id}
          style={{ padding: '1rem 0' }}
        >
          <Text component='p' style={{ margin: 0 }}>
            {section.content}
          </Text>
        </TabPanel>
      ))}
    </div>
  )
}
