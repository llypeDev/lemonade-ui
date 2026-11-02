import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Toast } from './Toast'
import { ToastOptions, ToastProvider, useToast } from './ToastProvider'

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
})

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  let toast: ReturnType<typeof useToast>

  function Trigger() {
    toast = useToast()
    return null
  }

  const renderProvider = () =>
    render(
      <ToastProvider>
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

  it('should throw a helpful error when used outside a ToastProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Trigger />)).toThrow('useToast must be used inside a ToastProvider')
    ;(console.error as jest.Mock).mockRestore()
  })
})
