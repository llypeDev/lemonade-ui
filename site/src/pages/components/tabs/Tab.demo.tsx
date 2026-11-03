import { TabItem, Tabs } from '@lemonade/ui'
import React, { useState } from 'react'

function TabEx() {
  const [active, setActive] = useState(1)

  return (
    <Tabs>
      <TabItem active={active === 0} onClick={() => setActive(0)}>
        First item
      </TabItem>
      <TabItem active={active === 1} onClick={() => setActive(1)}>
        Second item
      </TabItem>
      <TabItem active={active === 2} onClick={() => setActive(2)}>
        Third item
      </TabItem>
      <TabItem disabled>Disabled item</TabItem>
    </Tabs>
  )
}

export default TabEx
