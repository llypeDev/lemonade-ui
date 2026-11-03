import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Modal } from '../Modal/Modal'

import { Drawer, DrawerPlacement, DrawerProps } from './Drawer'

jest.mock('../../util/string')

describe('Drawer', () => {
  it('should render correctly', () => {
    const { baseElement } = render(
      <Drawer open title='Filters' footer={<button>Apply</button>}>
        Content
      </Drawer>
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should render nothing when closed', () => {
    const { queryByRole } = render(<Drawer open={false}>Content</Drawer>)
    expect(queryByRole('dialog')).toBeNull()
  })

  it('should be a modal dialog named by its title', () => {
    const { getByRole } = render(
      <Drawer open title='Filters'>
        Content
      </Drawer>
    )
    const dialog = getByRole('dialog', { name: 'Filters' })

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('Content')
  })

  it('should move the focus to the panel when opened', () => {
    const { getByRole } = render(
      <Drawer open title='Filters'>
        <button>Inside</button>
      </Drawer>
    )
    expect(getByRole('dialog')).toHaveFocus()
  })

  it('should accept aria-label when there is no title', () => {
    const { getByRole } = render(
      <Drawer open aria-label='Menu'>
        Content
      </Drawer>
    )
    expect(getByRole('dialog', { name: 'Menu' })).not.toHaveAttribute('aria-labelledby')
  })

  it('should call onClose from the close button, Escape and the backdrop', () => {
    const onClose = jest.fn()
    const { getByRole, getByTestId } = render(
      <Drawer open title='Filters' onClose={onClose}>
        Content
      </Drawer>
    )

    fireEvent.click(getByRole('button', { name: 'Close' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(getByTestId('backdrop'))

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('should not close with Escape while a modal opened from it is on top', () => {
    const onClose = jest.fn()
    const onModalClose = jest.fn()
    const createComponent = (modalOpen: boolean) => (
      <Drawer open title='Filters' onClose={onClose}>
        <Modal open={modalOpen} onClose={onModalClose}>
          <button>Apply</button>
        </Modal>
      </Drawer>
    )

    const { rerender } = render(createComponent(false))
    rerender(createComponent(true))
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })

    expect(onModalClose).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should not close on backdrop click when closeOnBackdropClick is false', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(
      <Drawer open title='Filters' onClose={onClose} closeOnBackdropClick={false}>
        Content
      </Drawer>
    )

    fireEvent.click(getByTestId('backdrop'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should hide the close button when hasCloseButton is false', () => {
    const { queryByRole } = render(
      <Drawer open title='Filters' hasCloseButton={false}>
        Content
      </Drawer>
    )
    expect(queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('should remove the page scroll only while open', () => {
    const { rerender } = render(
      <Drawer open title='Filters'>
        Content
      </Drawer>
    )
    expect(document.body.classList.length).toBe(1)

    rerender(
      <Drawer open={false} title='Filters'>
        Content
      </Drawer>
    )
    expect(document.body.classList.length).toBe(0)
  })
})

describe('Drawer animation', () => {
  const { matchMedia } = window
  const prefersReducedMotion = (reduce: boolean) => {
    window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
  }

  beforeEach(() => {
    jest.useFakeTimers()
    prefersReducedMotion(false)
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    window.matchMedia = matchMedia
    jest.useRealTimers()
  })

  const createComponent = (open: boolean, props: Partial<DrawerProps> = {}) => (
    <>
      <button>Open</button>
      <button>Other</button>
      <Drawer open={open} title='Filters' {...props}>
        <button>Inside</button>
      </Drawer>
    </>
  )

  // The drawer leaves the accessibility tree as soon as it starts to close, so it is found by its role attribute
  const queryPanel = () => document.body.querySelector('[role="dialog"]')

  it('should slide in from its edge', () => {
    // Its place out of the screen is laid out before it slides, otherwise the browser has nothing to slide from
    const transforms: string[] = []
    const { getBoundingClientRect } = HTMLElement.prototype
    const layout = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        this.getAttribute('role') === 'dialog' && transforms.push(getComputedStyle(this).transform)
        return getBoundingClientRect.call(this)
      })

    const { rerender } = render(createComponent(false, { placement: 'left' }))
    rerender(createComponent(true, { placement: 'left' }))
    layout.mockRestore()

    expect(transforms).toEqual(['translateX(-100%)'])
    expect(queryPanel()).toHaveStyle('transform: none')
    expect(queryPanel()).toHaveStyle('transition: transform 200ms ease-out')
  })

  it('should slide out before it leaves the page', () => {
    const { rerender, getByTestId } = render(createComponent(true))
    expect(queryPanel()).toHaveStyle('transform: none')

    rerender(createComponent(false))
    expect(queryPanel()).toBeInTheDocument()
    expect(queryPanel()).toHaveStyle('transform: translateX(100%)')
    expect(queryPanel()).toHaveStyle('transition: transform 200ms ease-in')
    expect(getByTestId('backdrop')).toHaveStyle('opacity: 0')

    act(() => {
      jest.advanceTimersByTime(199)
    })
    expect(queryPanel()).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(queryPanel()).toBeNull()
  })

  it.each([
    ['top', 'translateY(-100%)'],
    ['bottom', 'translateY(100%)'],
    ['left', 'translateX(-100%)'],
  ] as [DrawerPlacement, string][])('should slide out to the %s', (placement, transform) => {
    const { rerender } = render(createComponent(true, { placement }))
    rerender(createComponent(false, { placement }))
    expect(queryPanel()).toHaveStyle(`transform: ${transform}`)
  })

  it('should take no clicks, focus or Escape while it slides out', () => {
    const onClose = jest.fn()
    const { rerender, getByTestId } = render(createComponent(true, { onClose }))
    const wrapper = queryPanel().parentElement
    expect(wrapper).not.toHaveAttribute('aria-hidden')
    expect(wrapper).not.toHaveAttribute('inert')

    rerender(createComponent(false, { onClose }))
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper).toHaveAttribute('inert')
    expect(wrapper).toHaveStyleRule('pointer-events', 'none')

    fireEvent.click(getByTestId('backdrop'))
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should give the focus and the page scroll back as soon as it starts to close', () => {
    const { rerender, getByText } = render(createComponent(false))
    getByText('Open').focus()

    rerender(createComponent(true))
    act(() => {
      jest.runOnlyPendingTimers()
    })
    expect(queryPanel()).toHaveFocus()
    expect(document.body.classList.length).toBe(1)

    rerender(createComponent(false))
    expect(queryPanel()).toBeInTheDocument()
    expect(getByText('Open')).toHaveFocus()
    expect(document.body.classList.length).toBe(0)

    // The focus trap is released, and the focus does not move again when the drawer leaves the page
    getByText('Other').focus()
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(queryPanel()).toBeNull()
    expect(getByText('Other')).toHaveFocus()
  })

  it('should open again while it slides out', () => {
    const onClose = jest.fn()
    const { rerender, getByRole } = render(createComponent(true, { onClose }))

    rerender(createComponent(false, { onClose }))
    act(() => {
      jest.advanceTimersByTime(100)
    })
    rerender(createComponent(true, { onClose }))
    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(getByRole('dialog', { name: 'Filters' })).toHaveStyle('transform: none')
    expect(getByRole('dialog').parentElement).not.toHaveAttribute('aria-hidden')
    expect(document.body.classList.length).toBe(1)

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should leave the page at once with reduced motion', () => {
    prefersReducedMotion(true)
    const { rerender } = render(createComponent(true))

    rerender(createComponent(false))
    expect(queryPanel()).toBeNull()
  })

  it('should not slide with reduced motion, even when the browser lays out the panel out of the screen', () => {
    // Such as when the focus trap looks for what it can focus
    prefersReducedMotion(true)
    const { getByTestId } = render(createComponent(true))
    const media = '(prefers-reduced-motion:reduce)'

    expect(queryPanel()).toHaveStyleRule('transition', 'none', { media })
    expect(getByTestId('backdrop')).toHaveStyleRule('transition', 'none', { media })
  })
})
