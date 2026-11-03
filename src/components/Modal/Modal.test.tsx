import { act, fireEvent, getByRole, render, waitFor } from '@testing-library/react'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { createMockModalContext } from '../../test/utils/createMockModalContext'
import { ModalContextProvider } from '../../hooks/useModalContext'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog'
import { Drawer } from '../Drawer/Drawer'
import { Modal, ModalProps } from './Modal'
import { ModalBody } from './ModalBody'
import { ModalHeader } from './ModalHeader'

jest.mock('../../util/string')

describe('Modal', () => {
  it('should render correctly when closed', () => {
    render(<Modal open={false}>Testing.</Modal>)
    expect(document.body).toMatchSnapshot()
  })

  it('should render correctly when opened', () => {
    render(<Modal open={true}>Testing.</Modal>)
    expect(document.body).toMatchSnapshot()
  })

  it('should render on a portal', () => {
    const { container } = render(<Modal open={true}>Testing.</Modal>)
    expect(container.innerHTML).toBeFalsy()
    expect(document.body).toBeTruthy()
  })

  it('should accept "style" prop and pass down to ModalContainer', () => {
    render(
      <Modal open={true} style={{ color: 'red' }}>
        Testing.
      </Modal>
    )
    expect(document.body).toMatchSnapshot()
  })

  it('should accept "depthLevel" prop and pass down to ModalContainer', () => {
    render(
      <Modal open={true} depthLevel={2}>
        Testing.
      </Modal>
    )
    expect(document.body).toMatchSnapshot()
  })

  it('should accept "wrapperStyle" prop and apply it to the element that wraps the modal', () => {
    render(
      <Modal open={true} wrapperStyle={{ padding: 0 }}>
        Testing.
      </Modal>
    )
    expect(getByRole(document.body, 'dialog').parentElement).toHaveStyle('padding: 0px')
  })

  it('should accept "backdropStyle" prop and apply it to the backdrop', () => {
    const { getByTestId } = render(
      <Modal open={true} backdropStyle={{ backgroundColor: 'rgb(255, 0, 0)' }}>
        Testing.
      </Modal>
    )
    expect(getByTestId('backdrop')).toHaveStyle('background-color: rgb(255, 0, 0)')
  })

  it(`should'n add "overflow: hidden" property to document when manageOverflow is false`, () => {
    render(
      <Modal open={true} manageOverflow={false}>
        Testing.
      </Modal>
    )
    expect(document.body.classList).not.toContainEqual('oveflow')
    expect(document.body).toMatchSnapshot()
  })

  it('should override ModalContainer props and pass down props to it', () => {
    render(
      <Modal open={true} role='alertdialog'>
        Testing.
      </Modal>
    )
    expect(document.body.querySelector('[aria-modal="true"]').getAttribute('role')).toEqual('alertdialog')
  })

  describe('sizes', () => {
    it('should accept the "small" size and render accordingly', () => {
      render(
        <Modal open={true} size='small'>
          Testing.
        </Modal>
      )
      expect(document.body).toMatchSnapshot()
    })

    it('should accept the "medium" size and render accordingly', () => {
      render(
        <Modal open={true} size='medium'>
          Testing.
        </Modal>
      )
      expect(document.body).toMatchSnapshot()
    })

    it('should accept the "large" size and render accordingly', () => {
      render(
        <Modal open={true} size='large'>
          Testing.
        </Modal>
      )
      expect(document.body).toMatchSnapshot()
    })

    it('should accept the "auto" size and render accordingly', () => {
      render(
        <Modal open={true} size='auto'>
          Testing.
        </Modal>
      )
      expect(document.body).toMatchSnapshot()
    })
  })
})

it('should call "onClose" when backdrop is clicked and closeOnBackdropClick prop is true', () => {
  const handleClose = jest.fn()
  const createComponent = (props: Partial<ModalProps> = {}) => (
    <Modal open={true} onClose={handleClose} {...props}>
      Modal
    </Modal>
  )

  const { rerender, getByTestId } = render(createComponent())
  const backdrop = getByTestId('backdrop')
  expect(handleClose).not.toHaveBeenCalled()
  fireEvent.click(backdrop)
  expect(handleClose).toHaveBeenCalledTimes(1)

  rerender(createComponent({ closeOnBackdropClick: false }))
  fireEvent.click(backdrop)
  expect(handleClose).toHaveBeenCalledTimes(1)
})

it('should call "onClose" when key "Escape" is pressed and modal is open', () => {
  const handleClose = jest.fn()
  const createComponent = (props: Partial<ModalProps> = {}) => (
    <Modal open={true} onClose={handleClose} {...props}>
      Modal
    </Modal>
  )

  const { rerender } = render(createComponent())
  expect(handleClose).not.toHaveBeenCalled()
  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(handleClose).toHaveBeenCalledTimes(1)

  rerender(createComponent({ open: false }))
  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(handleClose).toHaveBeenCalledTimes(1)
})

it('should close only the dialog on top with "Escape"', () => {
  const onClose = jest.fn()
  const onCancel = jest.fn()
  const createComponent = (confirmOpen: boolean) => (
    <Modal open onClose={onClose}>
      <button>Delete</button>
      <ConfirmDialog open={confirmOpen} title='Delete this order?' onConfirm={jest.fn()} onCancel={onCancel} />
    </Modal>
  )

  const { rerender } = render(createComponent(false))
  rerender(createComponent(true))
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })

  expect(onCancel).toHaveBeenCalledTimes(1)
  expect(onClose).not.toHaveBeenCalled()

  rerender(createComponent(false))
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  expect(onClose).toHaveBeenCalledTimes(1)
})

it('should keep the page scroll removed until the last modal or drawer closes', () => {
  const createComponent = (first: boolean, second: boolean, drawer = false) => (
    <>
      <Modal open={first}>First</Modal>
      <Modal open={second}>Second</Modal>
      <Drawer open={drawer} aria-label='Filters' />
    </>
  )

  // A closed modal that mounts does not give the page its scroll back
  const { rerender } = render(createComponent(true, false))
  expect(document.body.classList.length).toBe(1)

  rerender(createComponent(true, true, true))
  rerender(createComponent(true, false, true))
  expect(document.body.classList.length).toBe(1)

  rerender(createComponent(false, false, true))
  expect(document.body.classList.length).toBe(1)

  rerender(createComponent(false, false, false))
  expect(document.body.classList.length).toBe(0)
})

it('should focus the modal when it has nothing focusable', async () => {
  const createComponent = (open: boolean) => (
    <>
      <button>Open</button>
      <Modal open={open}>Only text</Modal>
    </>
  )

  const { rerender, getByText } = render(createComponent(false))
  getByText('Open').focus()
  rerender(createComponent(true))

  await waitFor(() => expect(getByRole(document.body, 'dialog').parentElement).toHaveFocus())
})

it('should be named by the title of its header', () => {
  const { getByRole } = render(
    <Modal open>
      <ModalHeader title='Edit order' subtitle='Order 123' />
      <ModalBody>Content</ModalBody>
    </Modal>
  )
  expect(getByRole('dialog', { name: 'Edit order' })).toBeInTheDocument()
})

it('should keep the name given to it', () => {
  const { getByRole, rerender } = render(
    <Modal open aria-label='Order'>
      <ModalHeader title='Edit order' />
    </Modal>
  )
  expect(getByRole('dialog', { name: 'Order' })).not.toHaveAttribute('aria-labelledby')

  rerender(
    <Modal open aria-labelledby='other-title'>
      <ModalHeader title='Edit order' />
      <span id='other-title'>Other title</span>
    </Modal>
  )
  expect(getByRole('dialog', { name: 'Other title' })).toBeInTheDocument()

  rerender(
    <Modal open>
      <ModalHeader>
        <span>Custom header</span>
      </ModalHeader>
    </Modal>
  )
  expect(getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
})

it('should have a focus on first element when opened', async () => {
  const createComponent = (props: Partial<ModalProps> = {}) => (
    <>
      <button>Open</button>
      <Modal open={false} {...props}>
        Modal
        <button>First button</button>
      </Modal>
    </>
  )

  const { rerender, getByText } = render(createComponent())
  const button = getByText('Open')
  button.focus()
  expect(document.activeElement).toEqual(button)

  rerender(createComponent({ open: true }))

  const dialog = getByRole(document.body, 'dialog')

  const firstFocusableElement = dialog.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  await waitFor(() => {
    expect(document.activeElement).toEqual(firstFocusableElement)
  })
})

it('should accept "containerRef" prop and pass down to ModalContainer', () => {
  const ref = React.createRef<HTMLDivElement>()
  render(
    <Modal open={true} containerRef={ref}>
      Testing.
    </Modal>
  )
  expect(document.body.querySelector('[aria-modal="true"]')).toBe(findDOMNode(ref.current))
})

describe('modal scroll mode', () => {
  it("should set Modal overflow to hidden when scroll is 'body'", () => {
    const { getByRole } = render(
      <Modal open>
        <ModalBody data-testid=''>Modal content</ModalBody>
      </Modal>
    )
    const dialog = getByRole('dialog')
    expect(dialog).toHaveStyle('overflow: hidden;')
  })

  it("should set ModalBody overflow to auto when scroll is 'body'", () => {
    const { getByTestId } = render(
      <Modal open>
        <ModalBody data-testid='modal-body'>Modal content</ModalBody>
      </Modal>
    )
    const modalBody = getByTestId('modal-body')
    expect(modalBody).toHaveStyle('overflow: auto;')
  })

  it("should set Modal overflow to auto when scroll is 'full'", () => {
    const { getByRole } = render(
      <Modal open scroll='full'>
        <ModalBody data-testid=''>Modal content</ModalBody>
      </Modal>
    )
    const dialog = getByRole('dialog')
    expect(dialog).toHaveStyle('overflow: auto;')
  })

  it("should set ModalBody overflow to initial when scroll is 'full'", () => {
    const { getByTestId } = render(
      <Modal open scroll='full'>
        <ModalBody data-testid='modal-body'>Modal content</ModalBody>
      </Modal>
    )
    const modalBody = getByTestId('modal-body')
    expect(modalBody).toHaveStyle('overflow: initial;')
  })
})

describe('modal sections state', () => {
  it('should not call setSectionState when modal has no optional sections (header, left sidebar, right sidebar)', () => {
    const mockSetSectionState = jest.fn()

    const mockContextValue = createMockModalContext({ setSectionState: mockSetSectionState })

    render(
      <ModalContextProvider value={mockContextValue}>
        <ModalBody>Body content</ModalBody>
      </ModalContextProvider>
    )

    expect(mockSetSectionState).not.toHaveBeenCalled()
  })
})

// jsdom cannot parse some selectors, such as :focus-visible; they are of states, like the focus of the keyboard,
// that the elements of these tests are not in
const matches = (element: Element, selector: string) => {
  try {
    return element.matches(selector)
  } catch {
    return false
  }
}

// Value of a property of an element on a screen `width` pixels wide, from the rules on the page in their order
// (the rules of the modal all have the same specificity, so the last one wins)
const styleOnScreen = (element: Element, property: string, width: number) => {
  let value: string
  const visit = (rules: CSSRuleList) =>
    Array.from(rules).forEach((rule: any) => {
      if (rule.media) {
        const max = /max-width:\s*(\d+)px/.exec(rule.media.mediaText)
        const min = /min-width:\s*(\d+)px/.exec(rule.media.mediaText)
        if ((max && width <= Number(max[1])) || (min && width >= Number(min[1]))) {
          visit(rule.cssRules)
        }
      } else if (rule.selectorText && matches(element, rule.selectorText)) {
        value = rule.style.getPropertyValue(property) || value
      }
    })
  Array.from(document.styleSheets).forEach((sheet: CSSStyleSheet) => visit(sheet.cssRules))
  return value
}

describe('on small screens', () => {
  it('should use less space around the dialog', () => {
    render(<Modal open>Testing.</Modal>)
    const wrapper = getByRole(document.body, 'dialog').parentElement

    expect(wrapper).toHaveStyleRule('padding', '2rem')
    expect(wrapper).toHaveStyleRule('padding', '1rem', { media: '(max-width:600px)' })
    expect(styleOnScreen(wrapper, 'padding', 1366)).toBe('2rem')
    expect(styleOnScreen(wrapper, 'padding', 390)).toBe('1rem')
  })

  it('should keep the styles given to the wrapper and the dialog', () => {
    render(
      <Modal open wrapperStyle={{ padding: 0 }} style={{ maxHeight: '90vh' }}>
        Testing.
      </Modal>
    )
    const dialog = getByRole(document.body, 'dialog')

    expect(styleOnScreen(dialog.parentElement, 'padding', 390)).toBe('0')
    expect(styleOnScreen(dialog, 'max-height', 390)).toBe('90vh')
    expect(styleOnScreen(dialog, 'max-height', 1366)).toBe('90vh')
  })
})

describe('when it closes', () => {
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

  const createComponent = (open: boolean, props: Partial<ModalProps> = {}) => (
    <>
      <button>Open</button>
      <button>Other</button>
      <Modal open={open} {...props}>
        <ModalBody>
          <button>Inside</button>
        </ModalBody>
      </Modal>
    </>
  )

  // The dialog leaves the accessibility tree as soon as it starts to close, so it is found by its role attribute
  const queryDialog = () => document.body.querySelector('[role="dialog"]')
  const getFade = () => queryDialog().parentElement.parentElement

  it('should fade out before it leaves the page', () => {
    const { rerender } = render(createComponent(true))
    expect(getFade()).toHaveStyle('opacity: 1')

    rerender(createComponent(false))
    expect(queryDialog()).toBeInTheDocument()
    expect(getFade()).toHaveStyle('opacity: 0')

    act(() => {
      jest.advanceTimersByTime(199)
    })
    expect(queryDialog()).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(queryDialog()).toBeNull()
  })

  it('should take no clicks, focus or Escape while it fades out', () => {
    const onClose = jest.fn()
    const { rerender, getByTestId } = render(createComponent(true, { onClose }))
    expect(getFade()).not.toHaveAttribute('aria-hidden')
    expect(getFade()).not.toHaveAttribute('inert')

    rerender(createComponent(false, { onClose }))
    expect(getFade()).toHaveAttribute('aria-hidden', 'true')
    expect(getFade()).toHaveAttribute('inert')
    expect(getFade()).toHaveStyleRule('pointer-events', 'none')

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
    expect(getByText('Inside')).toHaveFocus()
    expect(document.body.classList.length).toBe(1)

    rerender(createComponent(false))
    expect(queryDialog()).toBeInTheDocument()
    expect(getByText('Open')).toHaveFocus()
    expect(document.body.classList.length).toBe(0)

    // The focus trap is released, and the focus does not move again when the dialog leaves the page
    getByText('Other').focus()
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(queryDialog()).toBeNull()
    expect(getByText('Other')).toHaveFocus()
  })

  it('should give the focus back when it is removed while open', () => {
    const { rerender, getByText } = render(createComponent(false))
    getByText('Open').focus()
    rerender(createComponent(true))
    act(() => {
      jest.runOnlyPendingTimers()
    })

    rerender(
      <>
        <button>Open</button>
        <button>Other</button>
      </>
    )
    expect(getByText('Open')).toHaveFocus()
  })

  it('should give the focus back to the modal under it', () => {
    const createStack = (confirmOpen: boolean) => (
      <Modal open>
        <button>Delete</button>
        <ConfirmDialog open={confirmOpen} title='Delete this order?' onConfirm={jest.fn()} onCancel={jest.fn()} />
      </Modal>
    )
    const { rerender, getByText } = render(createStack(false))
    act(() => {
      jest.runOnlyPendingTimers()
    })
    getByText('Delete').focus()

    rerender(createStack(true))
    act(() => {
      jest.runOnlyPendingTimers()
    })
    expect(getByText('Cancel').closest('button')).toHaveFocus()

    rerender(createStack(false))
    expect(getByText('Delete')).toHaveFocus()
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(getByText('Delete')).toHaveFocus()
  })

  it('should open again while it fades out', () => {
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

    expect(getByRole('dialog')).toBeInTheDocument()
    expect(getFade()).not.toHaveAttribute('aria-hidden')
    expect(getFade()).not.toHaveAttribute('inert')
    expect(getFade()).toHaveStyle('opacity: 1')
    expect(document.body.classList.length).toBe(1)

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onExited once it has left the page', () => {
    const onExited = jest.fn()
    const { rerender } = render(createComponent(true, { onExited }))

    rerender(createComponent(false, { onExited }))
    expect(onExited).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(onExited).toHaveBeenCalledTimes(1)
  })

  it('should leave the page at once with reduced motion', () => {
    prefersReducedMotion(true)
    const onExited = jest.fn()
    const { rerender } = render(createComponent(true, { onExited }))

    rerender(createComponent(false, { onExited }))
    expect(queryDialog()).toBeNull()
    expect(onExited).toHaveBeenCalledTimes(1)
  })
})
