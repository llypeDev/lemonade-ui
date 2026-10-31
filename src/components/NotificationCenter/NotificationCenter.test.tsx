import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { NotificationCenter, NotificationItem } from './NotificationCenter'

jest.mock('../../util/string')

// Popper places the panel asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

const now = Date.now()
const items: NotificationItem[] = [
  { id: '1', title: 'Order #1042 was paid', description: 'Ana Souza paid with a card', date: now - 5 * 60 * 1000 },
  { id: '2', title: 'New comment', description: 'Bruno: "Can we ship it today?"', date: now - 60 * 60 * 1000 },
  { id: '3', title: 'Export ready', date: now - 26 * 60 * 60 * 1000, read: true, href: '/exports/3' },
]

const Center = (props: { onClick?(n: NotificationItem): void }) => {
  const [list, setList] = useState(items)
  return (
    <NotificationCenter
      notifications={list}
      onNotificationClick={(clicked) => {
        setList(list.map((n) => (n.id === clicked.id ? { ...n, read: true } : n)))
        props.onClick && props.onClick(clicked)
      }}
      onMarkAllRead={() => setList(list.map((n) => ({ ...n, read: true })))}
      footer={<a href='/notifications'>See all</a>}
    />
  )
}

describe('NotificationCenter', () => {
  it('should render correctly when open', async () => {
    // A fixed moment keeps the relative times of the snapshot the same
    const spy = jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-05-10T12:00:00Z').getTime())
    const { getByRole } = render(
      <NotificationCenter notifications={items.map((item) => ({ ...item, date: '2024-05-10T09:00:00Z' }))} />
    )
    fireEvent.click(getByRole('button'))
    await flush()
    expect(getByRole('dialog')).toMatchSnapshot()
    spy.mockRestore()
  })

  it('should tell how many notifications are unread on the bell', () => {
    const { getByRole } = render(<Center />)
    const bell = getByRole('button', { name: 'Notifications, 2 unread' })
    expect(bell).toHaveTextContent('2')
  })

  it('should list the notifications, the unread first marked as such', async () => {
    const { getByRole, getAllByRole } = render(<Center />)
    fireEvent.click(getByRole('button', { name: /Notifications/ }))
    await flush()

    const panel = getByRole('dialog')
    expect(panel).toHaveAttribute('aria-labelledby', getByRole('heading', { name: 'Notifications' }).id)
    const entries = getAllByRole('listitem')
    expect(entries[0]).toHaveTextContent('Unread: Order #1042 was paidAna Souza paid with a card5 minutes ago')
    expect(entries[2]).toHaveTextContent('Export readyyesterday')
    expect(getByRole('link', { name: /Export ready/ })).toHaveAttribute('href', '/exports/3')
    expect(getByRole('link', { name: 'See all' })).toBeInTheDocument()
  })

  it('should open a notification and mark it as read', async () => {
    const onClick = jest.fn()
    const { getByRole } = render(<Center onClick={onClick} />)
    fireEvent.click(getByRole('button', { name: /Notifications/ }))
    await flush()

    fireEvent.click(getByRole('button', { name: /New comment/ }))
    expect(onClick).toHaveBeenCalledWith(items[1])
    expect(getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument()
  })

  it('should mark all as read', async () => {
    const { getByRole, queryByText } = render(<Center />)
    fireEvent.click(getByRole('button', { name: /Notifications/ }))
    await flush()

    fireEvent.click(getByRole('button', { name: 'Mark all as read' }))
    expect(queryByText(/Unread/)).not.toBeInTheDocument()
    expect(getByRole('button', { name: 'Mark all as read' })).toBeDisabled()
    expect(getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('should say when there are no notifications', async () => {
    const { getByRole, queryByRole } = render(<NotificationCenter notifications={[]} />)
    fireEvent.click(getByRole('button', { name: 'Notifications' }))
    await flush()

    expect(getByRole('dialog')).toHaveTextContent('No notifications')
    expect(queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument()
  })

  it('should close with Escape and give the focus back to the bell', async () => {
    const { getByRole, queryByRole } = render(<Center />)
    const bell = getByRole('button', { name: /Notifications/ })

    bell.focus()
    fireEvent.click(bell)
    await flush()
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(queryByRole('dialog')).not.toBeInTheDocument()
    expect(bell).toHaveFocus()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <NotificationCenter notifications={items} />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Notificações, 2 não lidas' })).toBeInTheDocument()
  })
})
