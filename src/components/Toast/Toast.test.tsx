import { act, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'

import { Toast } from './Toast'
import { ToastOptions, ToastProvider, ToastProviderProps, useToast } from './ToastProvider'

jest.mock('../../util/string')

describe('Toast', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Toast type='success' title='Saved' onClose={jest.fn()}>
        Your changes were saved.
      </Toast>
    )
    expect(container).toMatchSnapshot()
  })

  it('should render the title, message and action', () => {
    const { getByText, getByRole } = render(
      <Toast title='Saved' action={<a href='/history'>See history</a>}>
        Your changes were saved.
      </Toast>
    )

    expect(getByText('Saved')).toBeInTheDocument()
    expect(getByText('Your changes were saved.')).toBeInTheDocument()
    expect(getByRole('link', { name: 'See history' })).toHaveAttribute('href', '/history')
  })

  it('should only show the dismiss button when onClose is set', () => {
    const onClose = jest.fn()
    const { queryByRole, rerender } = render(<Toast>Message</Toast>)
    expect(queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()

    rerender(<Toast onClose={onClose}>Message</Toast>)
    fireEvent.click(queryByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should give the dismiss button to closeButtonRef', () => {
    const closeButtonRef = React.createRef<HTMLButtonElement>()
    const { getByRole } = render(
      <Toast onClose={jest.fn()} closeButtonRef={closeButtonRef}>
        Message
      </Toast>
    )

    expect(closeButtonRef.current).toBe(getByRole('button', { name: 'Close' }))
  })
})

let toast: ReturnType<typeof useToast>

function Trigger() {
  toast = useToast()
  return null
}

// `page` is rendered before the toasts, as the rest of an app would be
const renderProvider = (props: Omit<ToastProviderProps, 'children'> = {}, page?: React.ReactNode) =>
  render(
    <ToastProvider {...props}>
      {page}
      <Trigger />
    </ToastProvider>
  )

const show = (options: ToastOptions) => {
  let id: number
  act(() => {
    id = toast.show(options)
  })
  return id
}

const advance = (milliseconds: number) =>
  act(() => {
    jest.advanceTimersByTime(milliseconds)
  })

// The tooltip of a close button opens when it gets the focus
const focus = (element: HTMLElement) =>
  act(() => {
    element.focus()
  })

// Lets pending updates, such as the position of a tooltip that opened, settle inside act
const flush = () => act(async () => undefined)

// The toasts are unmounted after the real timers are back, so their fake timers would fire in the next test
const runWithFakeTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })
}

// The messages of the toasts on the page, in their order, including the ones leaving it
const shownMessages = () =>
  Array.from(document.querySelectorAll('[aria-live] [data-type]')).map((element) => element.textContent)

const toastOf = (message: string) => screen.getByText(message).closest('[data-type]') as HTMLElement

// A toast leaving the page is hidden from screen readers, so its button is found with `hidden`
const closeButtonOf = (message: string) => within(toastOf(message)).getByRole('button', { name: 'Close', hidden: true })

describe('ToastProvider', () => {
  runWithFakeTimers()

  it('should show toasts inside a polite live region', () => {
    const { getByText } = renderProvider()
    show({ title: 'Saved', message: 'Your changes were saved.' })

    expect(getByText('Your changes were saved.').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
  })

  it('should close a toast after 5 seconds by default', () => {
    const onClose = jest.fn()
    const { queryByText } = renderProvider()
    show({ message: 'Saved', onClose })

    act(() => {
      jest.advanceTimersByTime(4999)
    })
    expect(queryByText('Saved')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(queryByText('Saved')).not.toBeInTheDocument()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should keep a toast open while it is hovered or focused', () => {
    const { getByText, queryByText } = renderProvider()
    show({ message: 'Saved' })
    const element = getByText('Saved').closest('[data-type]')

    fireEvent.mouseEnter(element)
    act(() => {
      jest.advanceTimersByTime(10000)
    })
    expect(queryByText('Saved')).toBeInTheDocument()

    fireEvent.mouseLeave(element)
    fireEvent.focus(element)
    act(() => {
      jest.advanceTimersByTime(10000)
    })
    expect(queryByText('Saved')).toBeInTheDocument()

    fireEvent.blur(element)
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(queryByText('Saved')).not.toBeInTheDocument()
  })

  it('should keep a toast with duration 0 open until it is closed', () => {
    const { getByRole, queryByText } = renderProvider()
    show({ message: 'Connection lost', type: 'danger', duration: 0 })

    act(() => {
      jest.advanceTimersByTime(60000)
    })
    expect(queryByText('Connection lost')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(queryByText('Connection lost')).not.toBeInTheDocument()
  })

  it('should close a toast by its id', () => {
    const { queryByText } = renderProvider()
    const id = show({ message: 'Uploading...', duration: 0 })

    act(() => {
      toast.close(id)
    })
    expect(queryByText('Uploading...')).not.toBeInTheDocument()
  })

  it('should call onClose once, outside the state update, when toasts close together', () => {
    const onCloseFirst = jest.fn()
    const onCloseSecond = jest.fn()
    // StrictMode runs state updaters twice; it also warns about the findDOMNode of Tooltip, which is not tested here
    const originalError = console.error
    const consoleError = jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
      if (![message, ...args].join(' ').includes('findDOMNode')) {
        originalError(message, ...args)
      }
    })
    render(
      <React.StrictMode>
        <ToastProvider>
          <Trigger />
        </ToastProvider>
      </React.StrictMode>
    )
    const first = show({ message: 'First', duration: 0, onClose: onCloseFirst })
    const second = show({ message: 'Second', duration: 0, onClose: onCloseSecond })

    act(() => {
      toast.close(first)
      toast.close(second)
      toast.close(second)
    })
    expect(onCloseFirst).toHaveBeenCalledTimes(1)
    expect(onCloseSecond).toHaveBeenCalledTimes(1)
    consoleError.mockRestore()
  })

  it('should stack several toasts', () => {
    const { getByText } = renderProvider()
    show({ message: 'First' })
    show({ message: 'Second' })

    expect(getByText('First')).toBeInTheDocument()
    expect(getByText('Second')).toBeInTheDocument()
  })

  it('should show three toasts at most, and the next ones as the first ones close', () => {
    renderProvider()
    const first = show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })
    show({ message: 'Third', duration: 0 })
    show({ message: 'Fourth', duration: 0 })
    show({ message: 'Fifth', duration: 0 })
    expect(shownMessages()).toEqual(['First', 'Second', 'Third'])

    act(() => {
      toast.close(first)
    })
    expect(shownMessages()).toEqual(['Second', 'Third', 'Fourth'])

    fireEvent.click(closeButtonOf('Third'))
    expect(shownMessages()).toEqual(['Second', 'Fourth', 'Fifth'])
  })

  it('should take the most toasts shown at once from limit', () => {
    renderProvider({ limit: 1 })
    show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })

    expect(shownMessages()).toEqual(['First'])
  })

  it('should show waiting toasts at once when limit goes up', () => {
    const { rerender } = renderProvider({ limit: 1 })
    show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })
    show({ message: 'Third', duration: 0 })
    expect(shownMessages()).toEqual(['First'])

    rerender(
      <ToastProvider limit={2}>
        <Trigger />
      </ToastProvider>
    )
    expect(shownMessages()).toEqual(['First', 'Second'])
  })

  it('should count the time of a waiting toast from when it shows', () => {
    renderProvider({ limit: 1 })
    show({ message: 'First' })
    show({ message: 'Second' })

    advance(5000)
    expect(shownMessages()).toEqual(['Second'])

    advance(4999)
    expect(shownMessages()).toEqual(['Second'])

    advance(1)
    expect(shownMessages()).toEqual([])
  })

  it('should close a waiting toast by its id, before it shows', () => {
    const onClose = jest.fn()
    renderProvider({ limit: 1 })
    const first = show({ message: 'First', duration: 0 })
    const second = show({ message: 'Second', duration: 0, onClose })

    act(() => {
      toast.close(second)
    })
    expect(onClose).toHaveBeenCalledTimes(1)

    act(() => {
      toast.close(first)
    })
    expect(shownMessages()).toEqual([])
  })

  it('should not stack a toast identical to one on the screen, and count its time again', () => {
    const onCloseFirst = jest.fn()
    const onCloseSecond = jest.fn()
    renderProvider()
    const first = show({ type: 'success', message: 'Saved', onClose: onCloseFirst })

    advance(4000)
    const second = show({ type: 'success', message: 'Saved', onClose: onCloseSecond })
    expect(second).toBe(first)
    expect(shownMessages()).toEqual(['Saved'])

    advance(4999)
    expect(shownMessages()).toEqual(['Saved'])

    advance(1)
    expect(shownMessages()).toEqual([])
    // Each `show` gets its `onClose` called, once
    expect(onCloseFirst).toHaveBeenCalledTimes(1)
    expect(onCloseSecond).toHaveBeenCalledTimes(1)
  })

  it('should keep a toast open while it is hovered, when an identical one is shown', () => {
    renderProvider()
    show({ message: 'Saved' })
    fireEvent.mouseEnter(toastOf('Saved'))

    show({ message: 'Saved' })
    expect(shownMessages()).toEqual(['Saved'])

    advance(10000)
    expect(shownMessages()).toEqual(['Saved'])
  })

  it('should not stack a toast identical to one that waits', () => {
    renderProvider({ limit: 1 })
    const first = show({ message: 'First', duration: 0 })
    const second = show({ message: 'Second', duration: 0 })
    expect(show({ message: 'Second', duration: 0 })).toBe(second)

    act(() => {
      toast.close(first)
    })
    expect(shownMessages()).toEqual(['Second'])

    act(() => {
      toast.close(second)
    })
    expect(shownMessages()).toEqual([])
  })

  it('should stack toasts that differ in type, title or message', () => {
    renderProvider({ limit: 5 })
    show({ message: 'Saved' })
    // Identical to the first one, since info is the default type
    show({ type: 'info', message: 'Saved' })
    show({ type: 'success', message: 'Saved' })
    show({ type: 'success', title: 'Profile', message: 'Saved' })
    show({ type: 'success', message: 'Saved again' })

    expect(shownMessages()).toEqual(['Saved', 'Saved', 'ProfileSaved', 'Saved again'])
  })

  it('should keep a focused toast open after the pointer leaves it', () => {
    renderProvider()
    show({ message: 'Saved' })
    const element = toastOf('Saved')

    fireEvent.focus(element)
    fireEvent.mouseEnter(element)
    fireEvent.mouseLeave(element)
    advance(10000)
    expect(shownMessages()).toEqual(['Saved'])

    fireEvent.blur(element)
    advance(5000)
    expect(shownMessages()).toEqual([])
  })

  it('should throw a helpful error when used outside a ToastProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Trigger />)).toThrow('useToast must be used inside a ToastProvider')
    ;(console.error as jest.Mock).mockRestore()
  })
})

describe('ToastProvider focus', () => {
  runWithFakeTimers()

  it('should move the focus to the next toast when the toast that has it is closed', async () => {
    renderProvider()
    show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })
    show({ message: 'Third', duration: 0 })

    focus(closeButtonOf('Second'))
    fireEvent.click(closeButtonOf('Second'))
    await flush()

    expect(shownMessages()).toEqual(['First', 'Third'])
    expect(closeButtonOf('Third')).toHaveFocus()
  })

  it('should move the focus to the previous toast when the last one is closed', async () => {
    renderProvider()
    show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })

    focus(closeButtonOf('Second'))
    fireEvent.click(closeButtonOf('Second'))
    await flush()

    expect(closeButtonOf('First')).toHaveFocus()
  })

  it('should give the focus back to the element that had it before it entered the toasts', () => {
    renderProvider({}, <button>Save</button>)
    show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })
    const save = screen.getByRole('button', { name: 'Save' })

    focus(save)
    focus(closeButtonOf('Second'))
    // The focus goes from toast to toast as they close
    fireEvent.click(closeButtonOf('Second'))
    expect(closeButtonOf('First')).toHaveFocus()
    fireEvent.click(closeButtonOf('First'))

    expect(shownMessages()).toEqual([])
    expect(save).toHaveFocus()
  })

  it('should move the focus out of a toast closed by its action', async () => {
    renderProvider()
    const id = show({
      message: 'File deleted',
      duration: 0,
      action: <button onClick={() => toast.close(id)}>Undo</button>,
    })
    show({ message: 'Other', duration: 0 })

    focus(screen.getByRole('button', { name: 'Undo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await flush()

    expect(shownMessages()).toEqual(['Other'])
    expect(closeButtonOf('Other')).toHaveFocus()
  })

  it('should move the focus out of a toast closed from code', () => {
    renderProvider({}, <button>Save</button>)
    const id = show({ message: 'Uploading...', duration: 0 })

    focus(screen.getByRole('button', { name: 'Save' }))
    focus(closeButtonOf('Uploading...'))
    act(() => {
      toast.close(id)
    })

    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
  })

  it('should leave the focus where it is when the toast that closes does not have it', async () => {
    renderProvider()
    show({ message: 'First', duration: 0 })
    show({ message: 'Second' })

    focus(closeButtonOf('First'))
    advance(5000)
    await flush()

    expect(shownMessages()).toEqual(['First'])
    expect(closeButtonOf('First')).toHaveFocus()
  })

  it('should move the focus to the body when the element that had it is gone', () => {
    const { rerender } = renderProvider({}, <button>Save</button>)
    show({ message: 'Saved', duration: 0 })

    focus(screen.getByRole('button', { name: 'Save' }))
    focus(closeButtonOf('Saved'))
    rerender(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    )
    fireEvent.click(closeButtonOf('Saved'))

    expect(shownMessages()).toEqual([])
    expect(document.body).toHaveFocus()
  })
})

describe('ToastProvider animation', () => {
  const { matchMedia } = window
  const prefersReducedMotion = (reduce: boolean) => {
    window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
  }

  runWithFakeTimers()

  beforeEach(() => {
    prefersReducedMotion(false)
  })

  afterEach(() => {
    window.matchMedia = matchMedia
  })

  // The element around a toast, which animates when it leaves
  const itemOf = (message: string) => toastOf(message).parentElement

  it('should enter as before', () => {
    renderProvider()
    show({ message: 'Saved' })

    expect(toastOf('Saved')).toHaveStyleRule('animation', expect.stringContaining('.2s ease-out'))
    expect(toastOf('Saved')).toHaveStyleRule('animation', 'none', { media: '(prefers-reduced-motion:reduce)' })
  })

  it('should fade and slide out, then collapse its space, before it leaves the page', () => {
    const onClose = jest.fn()
    renderProvider()
    show({ message: 'First', duration: 0, onClose })
    show({ message: 'Second', duration: 0 })
    const item = itemOf('First')

    fireEvent.click(closeButtonOf('First'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(item).toBeInTheDocument()
    expect(item).toHaveStyle('opacity: 0')
    expect(item).toHaveStyle('transform: translateX(-1rem)')
    expect(item).toHaveStyle('transition: opacity 200ms ease-in,transform 200ms ease-in')

    advance(199)
    expect(item.style.height).toBe('')

    // Then its space collapses, so the toasts above it move down into place
    advance(1)
    expect(item).toHaveStyle('height: 0px')
    expect(item).toHaveStyle('overflow: hidden')
    expect(item).toHaveStyle('transition: height 200ms ease-in-out')

    advance(199)
    expect(item).toBeInTheDocument()

    advance(1)
    expect(item).not.toBeInTheDocument()
    expect(shownMessages()).toEqual(['Second'])
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should take no clicks, focus or screen reader while it leaves', () => {
    renderProvider()
    show({ message: 'Saved', duration: 0 })
    const item = itemOf('Saved')
    expect(item).not.toHaveAttribute('aria-hidden')
    expect(item).not.toHaveAttribute('inert')

    fireEvent.click(closeButtonOf('Saved'))
    expect(item).toHaveAttribute('aria-hidden', 'true')
    expect(item).toHaveAttribute('inert')
    expect(item).toHaveStyleRule('pointer-events', 'none')
  })

  it('should call onClose once when it is closed again while it leaves', () => {
    const onClose = jest.fn()
    renderProvider()
    const id = show({ message: 'Saved', onClose })

    act(() => {
      toast.close(id)
    })
    // The pointer leaving it does not count its time again
    fireEvent.mouseLeave(toastOf('Saved'))
    act(() => {
      toast.close(id)
    })
    advance(10000)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(shownMessages()).toEqual([])
  })

  it('should show a waiting toast once the one before it has left', () => {
    renderProvider({ limit: 1 })
    const first = show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })

    act(() => {
      toast.close(first)
    })
    expect(shownMessages()).toEqual(['First'])

    advance(400)
    expect(shownMessages()).toEqual(['Second'])
  })

  it('should show a new toast when an identical one is leaving', () => {
    renderProvider()
    const first = show({ message: 'Saved', duration: 0 })

    act(() => {
      toast.close(first)
    })
    const second = show({ message: 'Saved', duration: 0 })
    expect(second).not.toBe(first)
    expect(shownMessages()).toEqual(['Saved', 'Saved'])

    advance(400)
    expect(shownMessages()).toEqual(['Saved'])
  })

  it('should move the focus as soon as a toast starts to leave, and not to a toast that is leaving', async () => {
    renderProvider()
    show({ message: 'First', duration: 0 })
    show({ message: 'Second', duration: 0 })
    show({ message: 'Third', duration: 0 })

    focus(closeButtonOf('Third'))
    fireEvent.click(closeButtonOf('Third'))
    await flush()
    expect(closeButtonOf('Second')).toHaveFocus()

    fireEvent.click(closeButtonOf('Second'))
    await flush()
    expect(closeButtonOf('First')).toHaveFocus()
  })

  it('should leave the page at once with reduced motion', () => {
    prefersReducedMotion(true)
    renderProvider()
    show({ message: 'Saved', duration: 0 })

    fireEvent.click(closeButtonOf('Saved'))
    expect(shownMessages()).toEqual([])
  })
})
