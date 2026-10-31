import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { TabItem } from './TabItem'
import { TabPanel } from './TabPanel'
import { Tabs } from './Tabs'

it('renders correctly', () => {
  expect(
    render(
      <Tabs>
        <TabItem>Home</TabItem>
        <TabItem>Test</TabItem>
        <TabItem active>Active</TabItem>
        <TabItem disabled>Disabled</TabItem>
      </Tabs>
    ).container
  ).toMatchSnapshot()
})

it('should accept "style" prop', () => {
  expect(render(<Tabs style={{ color: 'red' }}>Children</Tabs>).container).toMatchSnapshot()
})

it('should have a roving tabindex', () => {
  const { container } = render(
    <Tabs>
      <TabItem>Home</TabItem>
      <TabItem>Test</TabItem>
      <TabItem active>Active</TabItem>
      <TabItem disabled>Disabled</TabItem>
    </Tabs>
  )
  const ul = container.querySelector('ul')
  const items = container.querySelectorAll<any>('[role="tab"]')
  // The keyboard enters the list on the active tab
  expect(items[0].getAttribute('tabindex')).toEqual('-1')
  expect(items[1].getAttribute('tabindex')).toEqual('-1')
  expect(items[2].getAttribute('tabindex')).toEqual('0')

  items[0].focus()
  expect(items[0].getAttribute('tabindex')).toEqual('0')
  expect(items[2].getAttribute('tabindex')).toEqual('-1')

  items[2].focus()
  expect(items[0].getAttribute('tabindex')).toEqual('-1')
  expect(items[1].getAttribute('tabindex')).toEqual('-1')
  expect(items[2].getAttribute('tabindex')).toEqual('0')

  fireEvent.keyDown(ul, { key: 'ArrowDown' })
  expect(items[2].getAttribute('tabindex')).toEqual('0')

  fireEvent.keyDown(ul, { key: 'ArrowUp' })
  expect(items[1].getAttribute('tabindex')).toEqual('0')
  expect(items[2].getAttribute('tabindex')).toEqual('-1')
})

it('should start on the first tab when none is active', () => {
  const { getAllByRole } = render(
    <Tabs>
      <TabItem disabled>Disabled</TabItem>
      <TabItem>Home</TabItem>
      <TabItem>Test</TabItem>
    </Tabs>
  )
  const items = getAllByRole('tab')
  expect(items[1]).toHaveAttribute('tabindex', '0')
  expect(items[2]).toHaveAttribute('tabindex', '-1')
})

it('should tell which tab is selected or disabled', () => {
  const { getByRole } = render(
    <Tabs>
      <TabItem>Home</TabItem>
      <TabItem active>Active</TabItem>
      <TabItem disabled>Disabled</TabItem>
    </Tabs>
  )
  expect(getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'false')
  expect(getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true')
  expect(getByRole('tab', { name: 'Disabled' })).toHaveAttribute('aria-disabled', 'true')
})

it('should render vertical tabs', () => {
  const { container, getByRole } = render(
    <Tabs orientation='vertical' aria-label='Settings'>
      <TabItem>Profile</TabItem>
      <TabItem active>Security</TabItem>
      <TabItem>Billing</TabItem>
    </Tabs>
  )
  expect(container).toMatchSnapshot()

  const list = getByRole('tablist')
  expect(list).toHaveAttribute('aria-orientation', 'vertical')

  const security = getByRole('tab', { name: 'Security' })
  security.focus()
  fireEvent.keyDown(list, { key: 'ArrowDown' })
  expect(getByRole('tab', { name: 'Billing' })).toHaveFocus()
})

it('should not set aria-orientation on horizontal tabs', () => {
  const { getByRole } = render(
    <Tabs>
      <TabItem>Home</TabItem>
    </Tabs>
  )
  expect(getByRole('tablist')).not.toHaveAttribute('aria-orientation')
})

it('should render tab panels linked to their tabs', () => {
  const { getByRole, queryByText } = render(
    <>
      <Tabs>
        <TabItem id='tab-profile' aria-controls='panel-profile' active>
          Profile
        </TabItem>
        <TabItem id='tab-billing' aria-controls='panel-billing'>
          Billing
        </TabItem>
      </Tabs>
      <TabPanel id='panel-profile' aria-labelledby='tab-profile'>
        Name and photo
      </TabPanel>
      <TabPanel id='panel-billing' aria-labelledby='tab-billing' active={false}>
        Cards and invoices
      </TabPanel>
    </>
  )

  const panel = getByRole('tabpanel')
  expect(panel).toHaveAttribute('tabindex', '0')
  expect(panel).toHaveTextContent('Name and photo')
  expect(queryByText('Cards and invoices')).not.toBeVisible()
})
