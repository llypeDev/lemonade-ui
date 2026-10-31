import { TabItem, TabPanel, Tabs, Text } from '@lemonade/ui'
import React, { useState } from 'react'

const sections = [
  { id: 'profile', label: 'Profile', content: 'Your name, photo and the languages you speak.' },
  { id: 'security', label: 'Security', content: 'Your password, two-step verification and active sessions.' },
  { id: 'billing', label: 'Billing', content: 'Your plan, payment cards and invoices.' },
]

function VerticalTabsDemo() {
  const [active, setActive] = useState('profile')

  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <Tabs orientation='vertical' aria-label='Settings' style={{ flexShrink: 0, width: '9rem' }}>
        {sections.map((section) => (
          <TabItem
            key={section.id}
            id={`demo-tab-${section.id}`}
            aria-controls={`demo-panel-${section.id}`}
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
          id={`demo-panel-${section.id}`}
          aria-labelledby={`demo-tab-${section.id}`}
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

export default VerticalTabsDemo
