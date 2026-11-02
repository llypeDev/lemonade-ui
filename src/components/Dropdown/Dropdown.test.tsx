import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import React, { useState } from 'react'
import { Modal } from '../Modal/Modal'
import { Dropdown, DropdownProps } from './Dropdown'
import { DropdownItem } from './DropdownItem'

jest.mock('../../util/string')

// Popper places the menu asynchronously, and the blur of the menu is handled after a timeout
const flush = () => act(async () => new Promise((resolve) => setTimeout(resolve)))

const ToggleTest = (props: Partial<DropdownProps>) => {
  const [anchorRef, setAnchorRef] = useState<HTMLButtonElement>()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button ref={setAnchorRef} onClick={() => setOpen(!open)}>
        Anchor
      </button>
      <Dropdown anchorRef={anchorRef} open={open} onClose={() => setOpen(false)} {...props}>
        <DropdownItem>Item #1</DropdownItem>
        <DropdownItem>Item #2</DropdownItem>
      </Dropdown>
      <input data-testid='outsideElement' />
    </>
  )
}

const openToggleTest = async () => {
  const result = render(<ToggleTest />)
  fireEvent.click(result.getByText('Anchor'))
  await flush()
  expect(result.getByRole('menuitem', { name: 'Item #1' })).toHaveFocus()
  return result
}

const DropdownTest = (props: Partial<DropdownProps> = {}) => {
  const [anchorRef, setAnchorRef] = useState<HTMLButtonElement>()
  return (
    <>
      <button ref={setAnchorRef}>Anchor</button>
      <Dropdown anchorRef={anchorRef} open={false} {...props}>
        <DropdownItem>Item #1</DropdownItem>
        <DropdownItem>Item #2</DropdownItem>
        <DropdownItem disabled>Item #3</DropdownItem>
      </Dropdown>
      <input data-testid='outsideElement' />
    </>
  )
}

it('should render correctly when closed', async () => {
  await act(async () => {
    render(<DropdownTest />)
  })
  expect(document.body).toMatchSnapshot()
})

it('should render correctly when open', async () => {
  await act(async () => {
    render(<DropdownTest open={true} />)
  })
  expect(document.body).toMatchSnapshot()
})

it('should accept popper props', async () => {
  await act(async () => {
    render(<DropdownTest open={true} popperProps={{ placement: 'top-start' }} />)
  })
  expect(document.body).toMatchSnapshot()
})

it('should extend DropdownMenu props', async () => {
  await act(async () => {
    render(<DropdownTest open={true} aria-label='test' style={{ color: 'red' }} />)
  })
  expect(document.body).toMatchSnapshot()
})

it('should control aria attributes on anchor element', async () => {
  let rerender: RenderResult['rerender']
  let getByText: RenderResult['getByText']

  await act(async () => {
    const result = render(<DropdownTest open={false} />)
    rerender = result.rerender
    getByText = result.getByText
  })

  const anchor = getByText('Anchor')

  expect(anchor.getAttribute('aria-haspopup')).toEqual('true')
  expect(anchor.getAttribute('aria-expanded')).toBeFalsy()
  expect(anchor.getAttribute('aria-controls')).toBeFalsy()

  await act(async () => {
    rerender(<DropdownTest open={true} />)
  })

  expect(anchor.getAttribute('aria-haspopup')).toEqual('true')
  expect(anchor.getAttribute('aria-expanded')).toEqual('true')
  expect(anchor.getAttribute('aria-controls')).toEqual('dropdown-abc')
})

it('should call "onClose" when "Escape" is pressed and dropdown is open', async () => {
  const close = jest.fn()

  let rerender: RenderResult['rerender']
  await act(async () => {
    rerender = render(<DropdownTest open={false} onClose={close} />).rerender
  })

  expect(close).not.toHaveBeenCalled()

  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(close).not.toHaveBeenCalled()

  await act(async () => {
    rerender(<DropdownTest open={true} onClose={close} />)
  })
  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(close).toHaveBeenCalledTimes(1)

  await act(async () => {
    rerender(<DropdownTest open={false} onClose={close} />)
  })
  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(close).toHaveBeenCalledTimes(1)
})

it('should call "onClose" when focus go outside menu', async () => {
  const close = jest.fn()
  let getByTestId
  await act(async () => {
    getByTestId = render(<DropdownTest open={true} onClose={close} />).getByTestId
  })

  expect(close).not.toHaveBeenCalled()

  getByTestId('outsideElement').focus()

  await waitFor(() => expect(close).toHaveBeenCalledTimes(1))
})

it('should call "onClose" when clicked outside menu and anchor', async () => {
  const close = jest.fn()
  await act(async () => {
    render(<DropdownTest open={true} onClose={close} />)
  })

  expect(close).not.toHaveBeenCalled()

  fireEvent.mouseDown(document.querySelector('ul'))
  fireEvent.mouseUp(document.querySelector('ul'))
  expect(close).not.toHaveBeenCalled()

  fireEvent.mouseDown(document.querySelector('button'))
  fireEvent.mouseUp(document.querySelector('button'))
  expect(close).not.toHaveBeenCalled()

  fireEvent.mouseDown(document.body)
  fireEvent.mouseUp(document.body)
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1))
})

it('should focus the first menu item when dropdown is opened', async () => {
  let rerender: RenderResult['rerender']
  await act(async () => {
    rerender = render(<DropdownTest open={false} />).rerender
  })

  expect(document.activeElement).toEqual(document.body)

  await act(async () => {
    rerender(<DropdownTest open={true} />)
  })
  await waitFor(() => {
    expect(document.activeElement).toEqual(document.body.querySelectorAll('li')[0])
  })
})

it('should call "onClose" if menu is clicked and "autoclose" is true', async () => {
  const close = jest.fn()
  let rerender: RenderResult['rerender']
  await act(async () => {
    rerender = render(<DropdownTest open={true} onClose={close} />).rerender
  })

  expect(close).toHaveBeenCalledTimes(0)
  fireEvent.click(document.body.querySelectorAll('li')[0])
  expect(close).toHaveBeenCalledTimes(1)

  rerender(<DropdownTest open={true} onClose={close} autoclose={false} />)
  fireEvent.click(document.body.querySelectorAll('li')[0])
  expect(close).toHaveBeenCalledTimes(1)
})

it('should NOT call "onClose" if item clicked is disabled', async () => {
  const close = jest.fn()

  await act(async () => {
    render(<DropdownTest open={true} onClose={close} />)
  })

  fireEvent.click(document.body.querySelectorAll('li')[2])
  expect(close).toHaveBeenCalledTimes(0)
})

it('should close when its anchor is clicked while it is open', async () => {
  const { getByText, queryByRole } = await openToggleTest()
  const anchor = getByText('Anchor')

  // Pressing the anchor moves the focus to it before the click
  fireEvent.mouseDown(anchor)
  anchor.focus()
  await flush()
  fireEvent.mouseUp(anchor)
  fireEvent.click(anchor)
  await flush()

  expect(queryByRole('menu')).not.toBeInTheDocument()
})

it('should close when the keyboard moves the focus to the anchor', async () => {
  const { getByText, queryByRole } = await openToggleTest()

  getByText('Anchor').focus()
  await flush()
  expect(queryByRole('menu')).not.toBeInTheDocument()
})

it('should call "onClose" once when the menu closes before its blur is handled', async () => {
  const close = jest.fn()
  const ClosingTest = () => {
    const [open, setOpen] = useState(true)
    const handleClose = () => {
      close()
      setOpen(false)
    }
    return <DropdownTest open={open} onClose={handleClose} />
  }
  const { getByTestId, getByRole } = render(<ClosingTest />)
  await flush()
  getByRole('menuitem', { name: 'Item #1' }).focus()

  // As Chrome does when the press outside removes the focused menu
  const outside = getByTestId('outsideElement')
  outside.focus()
  fireEvent.mouseDown(outside)
  await flush()

  expect(close).toHaveBeenCalledTimes(1)
})

it('should not call "onClose" after it unmounts', async () => {
  const close = jest.fn()
  const { getByTestId, getByRole, unmount } = render(<DropdownTest open onClose={close} />)
  await flush()
  getByRole('menuitem', { name: 'Item #1' }).focus()

  getByTestId('outsideElement').focus()
  unmount()
  await flush()

  expect(close).not.toHaveBeenCalled()
})

it('should give the focus back to the anchor when "Escape" closes it', async () => {
  const { getByText, queryByRole } = await openToggleTest()

  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  await flush()

  expect(queryByRole('menu')).not.toBeInTheDocument()
  expect(getByText('Anchor')).toHaveFocus()
})

it('should give the focus back to the anchor when an item is picked', async () => {
  const { getByText, getByRole, queryByRole } = await openToggleTest()

  fireEvent.click(getByRole('menuitem', { name: 'Item #2' }))
  await flush()

  expect(queryByRole('menu')).not.toBeInTheDocument()
  expect(getByText('Anchor')).toHaveFocus()
})

it('should not take the focus back when it leaves the menu', async () => {
  const { getByTestId, queryByRole } = await openToggleTest()
  const outside = getByTestId('outsideElement')

  outside.focus()
  await flush()

  expect(queryByRole('menu')).not.toBeInTheDocument()
  expect(outside).toHaveFocus()
})

it('should close only the menu with "Escape" when it is in a modal', async () => {
  const close = jest.fn()
  const closeModal = jest.fn()
  const createComponent = (open: boolean) => (
    <Modal open onClose={closeModal}>
      <DropdownTest open={open} onClose={close} />
    </Modal>
  )
  const { rerender } = render(createComponent(false))
  rerender(createComponent(true))
  await flush()

  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  expect(close).toHaveBeenCalledTimes(1)
  expect(closeModal).not.toHaveBeenCalled()
})

it('should keep its own handlers and id when it receives them', async () => {
  const close = jest.fn()
  const onClick = jest.fn()
  const onBlur = jest.fn()
  const { getByText, getByTestId, getByRole } = render(
    <DropdownTest open onClose={close} id='menu' onClick={onClick} onBlur={onBlur} />
  )
  await flush()

  expect(getByRole('menu')).toHaveAttribute('id', 'menu')
  expect(getByText('Anchor')).toHaveAttribute('aria-controls', 'menu')

  fireEvent.click(getByRole('menuitem', { name: 'Item #1' }))
  expect(onClick).toHaveBeenCalledTimes(1)
  expect(close).toHaveBeenCalledTimes(1)

  getByRole('menuitem', { name: 'Item #1' }).focus()
  getByTestId('outsideElement').focus()
  await flush()
  expect(onBlur).toHaveBeenCalled()
  expect(close).toHaveBeenCalledTimes(2)
})

it('should tell its placement and be positioned without a class for each position', async () => {
  const { getByRole } = render(<DropdownTest open popperProps={{ placement: 'top-start' }} />)
  await flush()

  const menu = getByRole('menu')
  expect(menu).toHaveAttribute('data-placement', 'top-start')
  expect(menu.style.position).toBe('absolute')
})
