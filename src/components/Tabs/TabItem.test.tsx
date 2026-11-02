import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { AnchorHTMLAttributes } from 'react'

import { TabItem, TabItemProps } from './TabItem'
import { Tabs } from './Tabs'

it('should render correctly', () => {
  const { container } = render(<TabItem>Item</TabItem>)
  expect(container).toMatchSnapshot()
})

it('should accept "style" prop', () => {
  const { container } = render(<TabItem style={{ color: 'red' }}>Item</TabItem>)
  expect(container).toMatchSnapshot()
})

it('should accept "component" prop', () => {
  const TabLink = (props: AnchorHTMLAttributes<HTMLAnchorElement> & TabItemProps) => (
    <TabItem component='a' {...props} />
  )

  const { container } = render(
    <Tabs>
      <TabLink href='/'>Home</TabLink>
      <TabLink href='/'>Test</TabLink>
      <TabLink href='/' active>
        Active
      </TabLink>
      <TabLink href='/' disabled>
        Disabled
      </TabLink>
    </Tabs>
  )
  expect(container).toMatchSnapshot()
})

it('should activate with Enter and Space when it is not a native button or link', () => {
  const onClick = jest.fn()
  const { getByRole } = render(
    <Tabs>
      <TabItem onClick={onClick}>Home</TabItem>
    </Tabs>
  )
  const tab = getByRole('tab', { name: 'Home' })

  fireEvent.keyDown(tab, { key: 'Enter' })
  expect(onClick).toHaveBeenCalledTimes(1)

  fireEvent.keyDown(tab, { key: ' ' })
  expect(onClick).toHaveBeenCalledTimes(2)

  fireEvent.keyDown(tab, { key: 'a' })
  expect(onClick).toHaveBeenCalledTimes(2)
})

it('should leave Enter and Space to a native button', () => {
  const onClick = jest.fn()
  const { getByRole } = render(
    <Tabs>
      <TabItem component='button' onClick={onClick}>
        Home
      </TabItem>
    </Tabs>
  )

  // The browser turns Enter and Space on a button into a click, so the tab does not do it twice
  fireEvent.keyDown(getByRole('tab', { name: 'Home' }), { key: 'Enter' })
  expect(onClick).not.toHaveBeenCalled()
})

it('should not activate a disabled tab', () => {
  const onClick = jest.fn()
  const { getByRole } = render(
    <Tabs>
      <TabItem disabled onClick={onClick}>
        Archived
      </TabItem>
      <TabItem component='button' disabled onClick={onClick}>
        Deleted
      </TabItem>
    </Tabs>
  )

  fireEvent.click(getByRole('tab', { name: 'Archived' }))
  fireEvent.keyDown(getByRole('tab', { name: 'Archived' }), { key: 'Enter' })
  expect(onClick).not.toHaveBeenCalled()
  expect(getByRole('tab', { name: 'Deleted' })).toBeDisabled()
})
