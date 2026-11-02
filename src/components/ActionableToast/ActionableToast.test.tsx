import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

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
})
