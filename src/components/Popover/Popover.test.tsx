import { act, fireEvent, render, RenderResult } from '@testing-library/react'
import React, { useState } from 'react'

import { Popover, PopoverProps } from './Popover'

jest.mock('../../util/string')

function PopoverTest(props: Partial<PopoverProps> & { defaultOpen?: boolean }) {
  const { defaultOpen = false, ...rest } = props
  const [anchor, setAnchor] = useState<HTMLButtonElement>()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <>
      <button ref={setAnchor} onClick={() => setOpen((state) => !state)}>
        Filters
      </button>
      <button>Outside</button>
      <Popover anchorRef={anchor} open={open} onClose={() => setOpen(false)} aria-label='Filters' {...rest}>
        <input aria-label='Name' />
        <button>Apply</button>
      </Popover>
    </>
  )
}

// Popper updates its position asynchronously, so each step waits for it inside act
const renderPopover = async (props: Partial<PopoverProps> & { defaultOpen?: boolean } = {}) => {
  let result: RenderResult
  await act(async () => {
    result = render(<PopoverTest {...props} />)
  })
  return result
}

const run = (callback: () => void) =>
  act(async () => {
    callback()
  })

describe('Popover', () => {
  it('should render correctly', async () => {
    const { container } = await renderPopover({ defaultOpen: true })
    expect(container).toMatchSnapshot()
  })

  it('should toggle from the anchor and link them with aria attributes', async () => {
    const { getByRole, queryByRole } = await renderPopover()
    const anchor = getByRole('button', { name: 'Filters' })

    expect(anchor).toHaveAttribute('aria-haspopup', 'dialog')
    expect(anchor).toHaveAttribute('aria-expanded', 'false')
    expect(queryByRole('dialog')).toBeNull()

    await run(() => fireEvent.click(anchor))
    const dialog = getByRole('dialog', { name: 'Filters' })
    expect(anchor).toHaveAttribute('aria-expanded', 'true')
    expect(anchor).toHaveAttribute('aria-controls', dialog.id)

    await run(() => fireEvent.click(anchor))
    expect(queryByRole('dialog')).toBeNull()
    expect(anchor).not.toHaveAttribute('aria-controls')
  })

  it('should move the focus to the first focusable element when opened', async () => {
    const { getByRole } = await renderPopover()

    await run(() => fireEvent.click(getByRole('button', { name: 'Filters' })))
    expect(getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })

  it('should not move the focus when autoFocus is false', async () => {
    const { getByRole } = await renderPopover({ autoFocus: false })
    const anchor = getByRole('button', { name: 'Filters' })

    anchor.focus()
    await run(() => fireEvent.click(anchor))
    expect(anchor).toHaveFocus()
  })

  it('should close with Escape and give the focus back to the anchor', async () => {
    const { getByRole, queryByRole } = await renderPopover({ defaultOpen: true })

    await run(() => fireEvent.keyDown(document, { key: 'Escape' }))

    expect(queryByRole('dialog')).toBeNull()
    expect(getByRole('button', { name: 'Filters' })).toHaveFocus()
  })

  it('should not move the focus on Escape when it was outside the popover', async () => {
    const { getByRole, queryByRole } = await renderPopover({ defaultOpen: true, autoFocus: false })
    const outside = getByRole('button', { name: 'Outside' })

    outside.focus()
    await run(() => fireEvent.keyDown(document, { key: 'Escape' }))

    expect(queryByRole('dialog')).toBeNull()
    expect(outside).toHaveFocus()
  })

  it('should close on a click outside, but not inside', async () => {
    const { getByRole, queryByRole } = await renderPopover({ defaultOpen: true })

    await run(() => fireEvent.mouseDown(getByRole('button', { name: 'Apply' })))
    expect(queryByRole('dialog')).toBeInTheDocument()

    await run(() => fireEvent.mouseDown(getByRole('button', { name: 'Outside' })))
    expect(queryByRole('dialog')).toBeNull()
  })

  it('should close when the focus leaves it', async () => {
    const { getByRole, queryByRole } = await renderPopover({ defaultOpen: true })

    await run(() =>
      fireEvent.blur(getByRole('button', { name: 'Apply' }), {
        relatedTarget: getByRole('button', { name: 'Outside' }),
      })
    )
    expect(queryByRole('dialog')).toBeNull()
  })

  it('should stay open while the focus moves inside it', async () => {
    const { getByRole } = await renderPopover({ defaultOpen: true })

    await run(() =>
      fireEvent.blur(getByRole('textbox', { name: 'Name' }), {
        relatedTarget: getByRole('button', { name: 'Apply' }),
      })
    )
    expect(getByRole('dialog')).toBeInTheDocument()
  })
})
