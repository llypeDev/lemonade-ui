import { BottomNavigation, Text } from '@lemonade/ui'
import React, { useState } from 'react'

function BottomNavigationDemo() {
  const [active, setActive] = useState('orders')

  return (
    <div style={{ maxWidth: '24rem', border: '1px solid #D3D4DD', borderRadius: 4 }}>
      <Text component='p' style={{ margin: 0, padding: '1rem', height: '8rem' }}>
        Page: {active}
      </Text>
      <BottomNavigation
        fixed={false}
        active={active}
        items={[
          { id: 'home', label: 'Home', icon: 'houseOutline', onClick: () => setActive('home') },
          { id: 'orders', label: 'Orders', icon: 'fileEmptyOutline', badge: 3, onClick: () => setActive('orders') },
          { id: 'customers', label: 'Customers', icon: 'userOutline', onClick: () => setActive('customers') },
          { id: 'more', label: 'More', icon: 'hamburguerMenu', onClick: () => setActive('more') },
        ]}
      />
    </div>
  )
}

export default BottomNavigationDemo
