import { act, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'

import { ToastMessagesInterface, useToastMessages } from '../../hooks/useToastMessages'

import { ActionableToast, ActionableToastProps } from './ActionableToast'
import { ActionableToastList } from './ActionableToastList'

jest.mock('../../util/string')

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  // The toasts are unmounted after the real timers are back, so their fake timers would fire in the next test
  jest.clearAllTimers()
  jest.useRealTimers()
})

const toastProps = (props: Partial<ActionableToastProps> = {}): ActionableToastProps => ({
  id: 1,
  title: 'Saved',
  message: 'Your changes were saved.',
  secondsVisible: 1,
  removeToast: jest.fn(),
  ...props,
})

describe('ActionableToastList', () => {
  it('should render the toasts inside a live region that exists before the first toast', () => {
    const { container, getByText, rerender } = render(<ActionableToastList data={[]} />)
    const region = container.querySelector('[aria-live="polite"]')
    expect(region).toBeInTheDocument()
    expect(region).toBeEmptyDOMElement()

    rerender(<ActionableToastList data={[toastProps()]} />)
    expect(container.querySelector('[aria-live="polite"]')).toBe(region)
    expect(region).toContainElement(getByText('Your changes were saved.'))
  })
})

describe('ActionableToast', () => {
  it('should not restart its timer when it gets a new removeToast function', () => {
    const first = jest.fn()
    const { rerender } = render(<ActionableToast {...toastProps({ removeToast: first })} />)

    act(() => {
      jest.advanceTimersByTime(600)
    })
    const second = jest.fn()
    rerender(<ActionableToast {...toastProps({ removeToast: second })} />)
    act(() => {
      // 1 second visible, then 0.5 second to slide out
      jest.advanceTimersByTime(900)
    })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledWith(1)
  })

  it('should keep a single timer when the pointer leaves more than once', () => {
    const removeToast = jest.fn()
    const { getByText } = render(<ActionableToast {...toastProps({ removeToast })} />)
    const element = getByText('Your changes were saved.').parentElement.parentElement

    fireEvent.mouseLeave(element)
    fireEvent.mouseLeave(element)
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(removeToast).toHaveBeenCalledTimes(1)
  })

  it('should stay open while it has the focus', () => {
    const removeToast = jest.fn()
    render(<ActionableToast {...toastProps({ removeToast })} />)
    const element = toastOf('Your changes were saved.')

    fireEvent.focus(element)
    fireEvent.mouseEnter(element)
    fireEvent.mouseLeave(element)
    advance(5000)
    expect(removeToast).not.toHaveBeenCalled()

    fireEvent.blur(element)
    advance(1000)
    expect(removeToast).toHaveBeenCalledTimes(1)
  })
})

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

// The element of a toast that takes the pointer and the focus, by its message
const toastOf = (message: string) => screen.getByText(message).parentElement.parentElement

// A toast leaving the page is hidden from screen readers, so its button is found with `hidden`
const closeButtonOf = (message: string) => within(toastOf(message)).getByRole('button', { name: 'Close', hidden: true })

// The toasts of an app, with the hook that keeps them
let showToast: (toast: ToastMessagesInterface) => void

function Toasts(props: { page?: React.ReactNode }) {
  const { toastMessages, showToast: show } = useToastMessages()
  showToast = show
  return (
    <>
      {props.page}
      <ActionableToastList data={toastMessages} />
    </>
  )
}

const show = (toast: ToastMessagesInterface) =>
  act(() => {
    showToast({ secondsVisible: 60, ...toast })
  })

const shownMessages = () =>
  Array.from(document.querySelectorAll('[aria-live] > div')).map((element) => element.textContent)

describe('ActionableToastList focus', () => {
  it('should move the focus to the next toast when the toast that has it closes', async () => {
    render(<Toasts />)
    show({ title: 'First', message: 'first' })
    show({ title: 'Second', message: 'second' })
    show({ title: 'Third', message: 'third' })

    focus(closeButtonOf('second'))
    fireEvent.click(closeButtonOf('second'))
    await flush()

    expect(shownMessages()).toEqual(['Firstfirst', 'Thirdthird'])
    expect(closeButtonOf('third')).toHaveFocus()
  })

  it('should move the focus to the previous toast when the last one closes', async () => {
    render(<Toasts />)
    show({ title: 'First', message: 'first' })
    show({ title: 'Second', message: 'second' })

    focus(closeButtonOf('second'))
    fireEvent.click(closeButtonOf('second'))
    await flush()

    expect(closeButtonOf('first')).toHaveFocus()
  })

  it('should give the focus back to the element that had it before it entered the toasts', () => {
    render(<Toasts page={<button>Save</button>} />)
    show({ title: 'Saved', message: 'saved' })
    const save = screen.getByRole('button', { name: 'Save' })

    focus(save)
    focus(closeButtonOf('saved'))
    fireEvent.click(closeButtonOf('saved'))

    expect(shownMessages()).toEqual([])
    expect(save).toHaveFocus()
  })

  it('should not close a toast that has the focus by its timer', async () => {
    render(<Toasts />)
    show({ title: 'Saved', message: 'saved', secondsVisible: 1 })

    focus(closeButtonOf('saved'))
    advance(5000)
    await flush()

    expect(shownMessages()).toEqual(['Savedsaved'])
    expect(closeButtonOf('saved')).toHaveFocus()
  })
})

describe('ActionableToast animation', () => {
  const { matchMedia } = window
  const prefersReducedMotion = (reduce: boolean) => {
    window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
  }

  beforeEach(() => {
    prefersReducedMotion(false)
  })

  afterEach(() => {
    window.matchMedia = matchMedia
  })

  // The element around a toast, which collapses when it leaves
  const itemOf = (message: string) => toastOf(message).parentElement

  it('should slide out, then collapse its space, before it is removed when its close button is clicked', () => {
    const removeToast = jest.fn()
    const onClose = jest.fn()
    render(<ActionableToastList data={[toastProps({ removeToast, onClose, secondsVisible: 5 })]} />)
    const element = toastOf('Your changes were saved.')
    const item = itemOf('Your changes were saved.')

    fireEvent.click(closeButtonOf('Your changes were saved.'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(removeToast).not.toHaveBeenCalled()
    expect(element).toHaveClass('hidden')
    expect(item).toHaveAttribute('aria-hidden', 'true')
    expect(item).toHaveAttribute('inert')
    expect(item).toHaveStyleRule('pointer-events', 'none')

    advance(499)
    expect(item.style.height).toBe('')

    advance(1)
    expect(item).toHaveStyle('height: 0px')
    expect(item).toHaveStyle('transition: height 200ms ease-in-out')

    advance(199)
    expect(removeToast).not.toHaveBeenCalled()

    advance(1)
    expect(removeToast).toHaveBeenCalledTimes(1)
    expect(removeToast).toHaveBeenCalledWith(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should slide out, then collapse its space, when its time is up', () => {
    const removeToast = jest.fn()
    render(<ActionableToast {...toastProps({ removeToast })} />)

    advance(1000)
    expect(toastOf('Your changes were saved.')).toHaveClass('hidden')

    advance(699)
    expect(removeToast).not.toHaveBeenCalled()

    advance(1)
    expect(removeToast).toHaveBeenCalledTimes(1)
  })

  it('should leave even when the pointer enters it while it slides out', () => {
    const removeToast = jest.fn()
    render(<ActionableToast {...toastProps({ removeToast })} />)

    advance(1000)
    fireEvent.mouseEnter(toastOf('Your changes were saved.'))
    advance(1000)

    expect(removeToast).toHaveBeenCalledTimes(1)
  })

  it('should be removed at once with reduced motion', () => {
    prefersReducedMotion(true)
    const removeToast = jest.fn()
    render(<ActionableToast {...toastProps({ removeToast })} />)

    advance(1000)
    expect(removeToast).toHaveBeenCalledTimes(1)
  })

  it('should not slide in with reduced motion', () => {
    prefersReducedMotion(true)
    render(<ActionableToast {...toastProps()} />)

    expect(toastOf('Your changes were saved.')).toHaveStyleRule('transition', 'none', {
      media: '(prefers-reduced-motion:reduce)',
    })
  })
})
