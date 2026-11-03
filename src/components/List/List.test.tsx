import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { focusRingStates } from '../../test/utils/resolveStyle'

import { List } from './List'
import { ListItem } from './ListItem'

describe('List', () => {
  it('should render correctly', () => {
    const { container } = render(
      <List aria-label='Team' bordered>
        <ListItem title='Ana Souza' description='ana@example.com' media={<span>AS</span>} extra={<span>Admin</span>} />
        <ListItem title='Bruno Lima' href='/people/bruno' />
        <ListItem title='Carla Dias' onClick={jest.fn()} />
      </List>
    )
    expect(container).toMatchSnapshot()
  })

  it('should render a list with the title and the description of each item', () => {
    const { getByRole, getAllByRole } = render(
      <List aria-label='Team'>
        <ListItem title='Ana Souza' description='ana@example.com' />
        <ListItem title='Bruno Lima' />
      </List>
    )

    expect(getByRole('list', { name: 'Team' })).toBeInTheDocument()
    expect(getAllByRole('listitem')).toHaveLength(2)
    expect(getAllByRole('listitem')[0]).toHaveTextContent('Ana Souzaana@example.com')
  })

  it('should render a link with href and pass other props to it', () => {
    const { getByRole } = render(
      <List>
        <ListItem title='Bruno Lima' href='/people/bruno' aria-current='page' />
      </List>
    )
    const link = getByRole('link', { name: 'Bruno Lima' })

    expect(link).toHaveAttribute('href', '/people/bruno')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('should render a button with onClick', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <List>
        <ListItem title='Carla Dias' onClick={onClick} />
      </List>
    )
    const button = getByRole('button', { name: 'Carla Dias' })

    expect(button).toHaveAttribute('type', 'button')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should render the extra content outside the link', () => {
    const onRemove = jest.fn()
    const { getByRole } = render(
      <List>
        <ListItem title='report.pdf' href='/files/report' extra={<button onClick={onRemove}>Remove</button>} />
      </List>
    )

    expect(getByRole('link').contains(getByRole('button', { name: 'Remove' }))).toBe(false)
    fireEvent.click(getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalled()
  })

  it('should render the item with a custom component', () => {
    const RouterLink = ({ to, children, ...props }: { to: string; children?: React.ReactNode }) => (
      <a href={`#${to}`} {...props}>
        {children}
      </a>
    )
    const { getByRole } = render(
      <List>
        <ListItem title='Settings' component={RouterLink} to='/settings' />
      </List>
    )
    expect(getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '#/settings')
  })

  it('should disable a button item', () => {
    const { getByRole } = render(
      <List>
        <ListItem title='Archived' onClick={jest.fn()} disabled />
      </List>
    )
    expect(getByRole('button', { name: 'Archived' })).toBeDisabled()
  })

  it('should disable a link item', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <List>
        <ListItem title='Reports' href='/reports' onClick={onClick} disabled />
      </List>
    )
    const link = getByRole('link', { name: 'Reports' })

    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).not.toHaveAttribute('href')
    expect(link).not.toHaveAttribute('disabled')
    expect(link).toHaveAttribute('tabindex', '-1')
    // fireEvent returns false when the default action, which follows the link, is prevented
    expect(fireEvent.click(link)).toBe(false)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should disable an item with a custom component', () => {
    const RouterLink = ({ to, children, ...props }: { to: string; children?: React.ReactNode }) => (
      <a href={`#${to}`} {...props}>
        {children}
      </a>
    )
    const { getByRole } = render(
      <List>
        <ListItem title='Settings' component={RouterLink} to='/settings' disabled />
      </List>
    )
    const link = getByRole('link', { name: 'Settings' })

    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(fireEvent.click(link)).toBe(false)
  })
})

it('should show the focus ring of an item for the keyboard, not after a click', () => {
  const { getByRole } = render(
    <List aria-label='Team'>
      <ListItem title='Bruno Lima' href='/people/bruno' />
      <ListItem title='Carla Dias' onClick={jest.fn()} />
    </List>
  )

  ;[getByRole('link', { name: 'Bruno Lima' }), getByRole('button', { name: 'Carla Dias' })].forEach((item) => {
    const { received, expected } = focusRingStates(item, { pseudoElement: '::after' })
    expect(received).toEqual(expected)
  })
})
