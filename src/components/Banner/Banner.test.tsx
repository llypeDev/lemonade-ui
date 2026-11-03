import { act, fireEvent, render } from '@testing-library/react'
import React, { useRef, useState } from 'react'

import { Banner, BannerProps } from './Banner'

// Enter on a focused button clicks it, as in the browser
const pressEnter = (element: HTMLElement) => {
  element.focus()
  fireEvent.keyDown(element, { key: 'Enter' })
  fireEvent.click(element)
}

// The focus moves once the page has taken the banner out
const flush = () => act(async () => undefined)

// A banner that the page takes out when it closes, with something else in its place if given
const Closable = (props: Partial<BannerProps> & { replacement?: React.ReactNode }) => {
  const { replacement = null, ...rest } = props
  const [open, setOpen] = useState(true)

  return open ? (
    <Banner onClose={() => setOpen(false)} {...rest}>
      Welcome!
    </Banner>
  ) : (
    <>{replacement}</>
  )
}

describe('Banner', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Banner
        type='alert'
        title='Your plan expires in 3 days.'
        actions={<a href='/billing'>Renew plan</a>}
        onClose={jest.fn()}
      >
        Renew it to keep your projects.
      </Banner>
    )
    expect(container).toMatchSnapshot()
  })

  it('should show the title, the text and the actions', () => {
    const { container, getByRole } = render(
      <Banner title='Scheduled maintenance.' actions={<a href='/status'>Learn more</a>}>
        The system will be offline on Sunday from 10 PM.
      </Banner>
    )
    expect(container).toHaveTextContent('Scheduled maintenance.The system will be offline on Sunday from 10 PM.')
    expect(getByRole('link', { name: 'Learn more' })).toBeInTheDocument()
  })

  it('should close with the close button', () => {
    const onClose = jest.fn()
    const { getByRole } = render(<Banner onClose={onClose}>Welcome!</Banner>)

    fireEvent.click(getByRole('button', { name: 'Close announcement' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not have a close button without onClose', () => {
    const { queryByRole } = render(<Banner>Welcome!</Banner>)
    expect(queryByRole('button')).toBeNull()
  })

  it('should pass other props, such as a role for a banner shown later', () => {
    const { getByRole } = render(<Banner role='status'>Saved</Banner>)
    expect(getByRole('status')).toHaveTextContent('Saved')
  })
})

describe('Banner focus after closing', () => {
  it('should move the focus to the first element after the banner', async () => {
    const { getByRole } = render(
      <>
        <Closable />
        <header>
          <button>Menu</button>
        </header>
      </>
    )

    pressEnter(getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(getByRole('button', { name: 'Menu' })).toHaveFocus()
  })

  it('should give the focus back to the element that had it before the banner', async () => {
    const { getByRole } = render(
      <>
        <Closable />
        <header>
          <button>Menu</button>
        </header>
        <input aria-label='Name' />
      </>
    )

    getByRole('textbox', { name: 'Name' }).focus()
    pressEnter(getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })

  it('should move the focus where returnFocus says, given as a ref or a function', async () => {
    const WithRef = () => {
      const ref = useRef<HTMLButtonElement>(null)
      return (
        <>
          <Closable returnFocus={ref} />
          <button>Menu</button>
          <button ref={ref}>Help</button>
        </>
      )
    }
    const first = render(<WithRef />)
    pressEnter(first.getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(first.getByRole('button', { name: 'Help' })).toHaveFocus()
    first.unmount()

    const second = render(
      <>
        <Closable returnFocus={() => document.getElementById('help')} />
        <button>Menu</button>
        <button id='help'>Help</button>
      </>
    )
    pressEnter(second.getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(second.getByRole('button', { name: 'Help' })).toHaveFocus()
  })

  it('should move the focus to what the page shows in place of the banner', async () => {
    const { getByRole } = render(
      <>
        <Closable replacement={<button>Show the banner again</button>} />
        <button>Menu</button>
      </>
    )

    pressEnter(getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(getByRole('button', { name: 'Show the banner again' })).toHaveFocus()
  })

  it('should move the focus before the banner when nothing comes after it, else to its container', async () => {
    const first = render(
      <>
        <a href='#top'>Top</a>
        <Closable />
      </>
    )
    pressEnter(first.getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(first.getByRole('link', { name: 'Top' })).toHaveFocus()
    first.unmount()

    const second = render(
      <main>
        <Closable />
      </main>
    )
    pressEnter(second.getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(second.getByRole('main')).toHaveFocus()
  })

  it('should also move the focus when an action of the banner takes it out', async () => {
    const Page = () => {
      const [open, setOpen] = useState(true)
      return (
        <>
          {open && <Banner actions={<button onClick={() => setOpen(false)}>Accept</button>}>Cookies</Banner>}
          <button>Menu</button>
        </>
      )
    }
    const { getByRole } = render(<Page />)

    pressEnter(getByRole('button', { name: 'Accept' }))
    await flush()
    expect(getByRole('button', { name: 'Menu' })).toHaveFocus()
  })

  it('should wait for the page to take the banner out', async () => {
    let takeOut: () => void
    const Page = () => {
      const [open, setOpen] = useState(true)
      takeOut = () => setOpen(false)
      return (
        <>
          {open && <Banner onClose={jest.fn()}>Welcome!</Banner>}
          <button>Menu</button>
        </>
      )
    }
    const { getByRole } = render(<Page />)
    const close = getByRole('button', { name: 'Close announcement' })

    pressEnter(close)
    await flush()
    expect(close).toHaveFocus()

    act(() => takeOut())
    await flush()
    expect(getByRole('button', { name: 'Menu' })).toHaveFocus()
  })

  it('should leave the focus alone when the banner did not have it or the page moved it', async () => {
    // A click that does not focus the button, as in Safari
    const first = render(
      <>
        <Closable />
        <button>Menu</button>
      </>
    )
    fireEvent.click(first.getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(document.body).toHaveFocus()
    first.unmount()

    const Page = () => {
      const [open, setOpen] = useState(true)
      const ref = useRef<HTMLInputElement>(null)
      return (
        <>
          {open && (
            <Banner
              onClose={() => {
                ref.current.focus()
                setOpen(false)
              }}
            >
              Welcome!
            </Banner>
          )}
          <button>Menu</button>
          <input ref={ref} aria-label='Name' />
        </>
      )
    }
    const second = render(<Page />)
    pressEnter(second.getByRole('button', { name: 'Close announcement' }))
    await flush()
    expect(second.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })
})
