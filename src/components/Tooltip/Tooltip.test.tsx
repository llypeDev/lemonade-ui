import { act, cleanup, createEvent, fireEvent, render, RenderResult, RenderOptions } from '@testing-library/react'
import React from 'react'

import { Tooltip, TooltipProps } from './Tooltip'

// Lets pending updates, such as popper positions and debounced loads, settle inside act
const flush = () => act(async () => undefined)

// Moves the timers, such as the delay before a tooltip opens, and lets Popper place the tooltips that open
const wait = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms)
  })

// The texts of the tooltips that show
const shownTooltips = () =>
  Array.from(document.body.querySelectorAll('[role="tooltip"][aria-hidden="false"]')).map((t) => t.textContent)

// jsdom has no PointerEvent, so the type of the pointer is set on the event
const pointerOver = (element: Element | Document, pointerType: string) => {
  const event = createEvent.pointerOver(element)
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  fireEvent(element, event)
}

jest.mock('../../util/string')

// The tooltips of the page share the timer that lets the next one open at once after one closes. Each test unmounts
// its tooltips and runs that timer out, so the next test starts without it.
beforeEach(() => jest.useFakeTimers())
afterEach(async () => {
  await cleanup()
  act(() => {
    jest.runOnlyPendingTimers()
  })
  jest.useRealTimers()
})

beforeEach(() => render(<div id='portal-root' />))

async function actRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'queries'>) {
  let renderResult!: RenderResult
  await act(async () => {
    renderResult = render(ui, options)
  })
  return renderResult
}

const TooltipTest = (props: Partial<TooltipProps>) => {
  return (
    <Tooltip
      text='Tooltip text'
      offset={2}
      placement='bottom-start'
      container={document.getElementById('portal-root')!}
      {...props}
    >
      <span data-testid='tooltip-inner-span'>Testing</span>
    </Tooltip>
  )
}

it('should render correctly', async () => {
  const { getByText } = await actRender(<TooltipTest />)
  expect(document.body).toMatchSnapshot()

  fireEvent.focus(getByText('Testing'))
  expect(document.body).toMatchSnapshot()
  await flush()
})

it('should not render tooltip if text if null or empty', async () => {
  const { getByText, getByTestId } = await actRender(<TooltipTest text='' />)
  expect(document.getElementById('portal-root')).not.toBeNull()
  expect(document.getElementById('portal-root')?.innerHTML).toEqual('')

  fireEvent.focus(getByText('Testing'))
  expect(document.getElementById('portal-root')).not.toBeNull()
  expect(document.getElementById('portal-root')?.innerHTML).toEqual('')

  expect(getByTestId('tooltip-inner-span').getAttribute('aria-describedby')).toBeFalsy()
  await flush()
})

it('should show tooltip when pointer enters component', async () => {
  const { getByText } = await actRender(<TooltipTest />)
  expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  fireEvent.pointerOver(getByText('Testing'))
  await wait(400)
  expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('false')
  await flush()
})

it('should show tooltip when focus component', async () => {
  const { getByText } = await actRender(<TooltipTest />)
  expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  fireEvent.focus(getByText('Testing'))
  expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('false')
  await flush()
})

it('should not show tooltip when the focus does not come from the keyboard', async () => {
  const { getByText } = await actRender(<TooltipTest />)
  const target = getByText('Testing')
  // As the browser reports the focus that a dialog opened with a click gives to its first button
  target.matches = (selector: string) => selector === ':focus'
  fireEvent.focus(target)
  expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()

  // The pointer still shows it
  fireEvent.pointerOver(target)
  await wait(400)
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('false')
  await flush()
})

it('should hide tooltip when pointer leaves component', async () => {
  const { getByText } = await actRender(<TooltipTest />)
  fireEvent.pointerOver(getByText('Testing'))
  await wait(400)
  fireEvent.pointerOver(document)
  expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('true')
  await flush()
})

it('should hide tooltip when blur component', async () => {
  const { getByText } = await actRender(<TooltipTest />)
  fireEvent.focus(getByText('Testing'))
  fireEvent.blur(getByText('Testing'))
  expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('true')
  await flush()
})

it('should compose onPointerEnter, onPointerLeave, onFocus and onBlur functions', async () => {
  const focus = jest.fn()
  const blur = jest.fn()
  const pointerEnter = jest.fn()
  const { getByText } = await actRender(
    <Tooltip text='Tooltip text' offset={2} placement='bottom-start'>
      <button onFocus={focus} onBlur={blur} onPointerEnter={pointerEnter}>
        Testing
      </button>
    </Tooltip>
  )

  const target = getByText('Testing')
  expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()

  await act(async () => {
    fireEvent.focus(target)
  })
  expect(focus).toHaveBeenCalledTimes(1)
  expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('false')

  fireEvent.blur(target)
  expect(blur).toHaveBeenCalledTimes(1)
  expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('true')

  fireEvent.pointerOver(target)
  await wait(400)
  expect(pointerEnter).toHaveBeenCalledTimes(1)
  expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
  expect(document.body.querySelector('[role="tooltip"]')?.getAttribute('aria-hidden')).toEqual('false')
  await flush()
})

it('should switch "title" and "aria-describedby" props on target element when tooltip is visible/invisible', async () => {
  const { getByTestId } = await actRender(<TooltipTest text='lorem' />)
  const target = getByTestId('tooltip-inner-span')

  expect(target.getAttribute('aria-describedby')).toEqual(null)
  expect(target.getAttribute('title')).toEqual('lorem')

  await act(async () => {
    fireEvent.focus(target)
  })

  expect(target.getAttribute('aria-describedby')).toEqual('tooltip-abc')
  expect(target.getAttribute('title')).toEqual(null)
  await flush()
})

it('should add the tooltip to the descriptions of the element', async () => {
  const { getByRole } = await actRender(
    <Tooltip text='Tooltip text'>
      <input aria-describedby='error' />
    </Tooltip>
  )
  const input = getByRole('textbox')
  expect(input).toHaveAttribute('aria-describedby', 'error')

  await act(async () => {
    fireEvent.focus(input)
  })
  expect(input).toHaveAttribute('aria-describedby', 'error tooltip-abc')

  fireEvent.blur(input)
  expect(input).toHaveAttribute('aria-describedby', 'error')
  await flush()
})

it('should keep the offset with the modifiers of the user', async () => {
  const { getByText } = await actRender(<TooltipTest modifiers={[{ name: 'flip', enabled: false }]} />)

  await act(async () => {
    fireEvent.focus(getByText('Testing'))
  })

  // The offset is 2rem, below the element
  expect(document.body.querySelector<HTMLElement>('[role="tooltip"]').style.transform).toEqual('translate(0px, 32px)')
})

describe('open delay', () => {
  const Buttons = (props: { openDelay?: number }) => (
    <>
      <Tooltip text='Bold' {...props}>
        <button>B</button>
      </Tooltip>
      <Tooltip text='Italic' {...props}>
        <button>I</button>
      </Tooltip>
      <Tooltip text='Underline' {...props}>
        <button>U</button>
      </Tooltip>
    </>
  )

  it('should open after the pointer rests on the element for the delay', async () => {
    const { getByText } = render(<TooltipTest />)
    const target = getByText('Testing')

    fireEvent.pointerOver(target)
    await wait(399)
    expect(shownTooltips()).toEqual([])
    expect(target).not.toHaveAttribute('aria-describedby')
    // Nor does the browser show its own tooltip meanwhile
    expect(target).not.toHaveAttribute('title')

    await wait(1)
    expect(shownTooltips()).toEqual(['Tooltip text'])
    expect(target).toHaveAttribute('aria-describedby', 'tooltip-abc')
    await flush()
  })

  it('should take the delay from the openDelay prop', async () => {
    const { getByText, rerender } = render(<TooltipTest openDelay={1000} />)

    fireEvent.pointerOver(getByText('Testing'))
    await wait(999)
    expect(shownTooltips()).toEqual([])
    await wait(1)
    expect(shownTooltips()).toEqual(['Tooltip text'])

    fireEvent.pointerOver(document.body)
    await wait(1000)
    rerender(<TooltipTest openDelay={0} />)
    fireEvent.pointerOver(getByText('Testing'))
    expect(shownTooltips()).toEqual(['Tooltip text'])
    await flush()
  })

  it('should not open when the pointer leaves the element before the delay', async () => {
    const { getByText } = render(<TooltipTest />)
    const target = getByText('Testing')

    fireEvent.pointerOver(target)
    await wait(200)
    fireEvent.pointerOver(document.body)
    await wait(1000)
    expect(shownTooltips()).toEqual([])
    expect(target).not.toHaveAttribute('aria-describedby')
    expect(target).toHaveAttribute('title', 'Tooltip text')

    // Nor when it leaves the page, which has no element to go over
    fireEvent.pointerOver(target)
    await wait(200)
    fireEvent.pointerOut(target)
    await wait(1000)
    expect(shownTooltips()).toEqual([])
    await flush()
  })

  it('should open the next tooltip at once while one shows', async () => {
    const { getByText } = render(<Buttons />)

    fireEvent.pointerOver(getByText('B'))
    expect(shownTooltips()).toEqual([])
    await wait(400)
    expect(shownTooltips()).toEqual(['Bold'])

    fireEvent.pointerOver(getByText('I'))
    expect(shownTooltips()).toEqual(['Italic'])
    fireEvent.pointerOver(getByText('U'))
    expect(shownTooltips()).toEqual(['Underline'])
    await flush()
  })

  it('should open the next tooltip at once shortly after one closed, and wait again later', async () => {
    const { getByText } = render(<Buttons />)

    fireEvent.pointerOver(getByText('B'))
    await wait(400)
    // The space between the buttons
    fireEvent.pointerOver(document.body)
    expect(shownTooltips()).toEqual([])
    await wait(299)
    fireEvent.pointerOver(getByText('I'))
    expect(shownTooltips()).toEqual(['Italic'])

    fireEvent.pointerOver(document.body)
    await wait(300)
    fireEvent.pointerOver(getByText('U'))
    expect(shownTooltips()).toEqual([])
    await wait(400)
    expect(shownTooltips()).toEqual(['Underline'])
    await flush()
  })

  it('should wait again after the tooltip that showed unmounts', async () => {
    const { getByText, rerender } = render(<Buttons />)

    fireEvent.pointerOver(getByText('B'))
    await wait(400)
    expect(shownTooltips()).toEqual(['Bold'])

    // A click on the button removes the buttons, with the tooltip that shows
    rerender(<></>)
    await wait(300)
    rerender(<Buttons />)
    fireEvent.pointerOver(getByText('I'))
    expect(shownTooltips()).toEqual([])
    await wait(400)
    expect(shownTooltips()).toEqual(['Italic'])
    await flush()
  })

  it('should not open, nor update, after it unmounts during the delay', async () => {
    const error = jest.spyOn(console, 'error')
    const { getByText, rerender } = render(<Buttons />)

    fireEvent.pointerOver(getByText('B'))
    await wait(200)
    rerender(<></>)
    await wait(1000)
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()

    rerender(<Buttons />)
    fireEvent.pointerOver(getByText('I'))
    expect(shownTooltips()).toEqual([])
    await flush()
  })

  it('should close, and not open later, when the text goes away', async () => {
    const { getByText, rerender } = render(<TooltipTest />)
    // Without a text, the element renders alone, so it is found again after each change

    // During the delay
    fireEvent.pointerOver(getByText('Testing'))
    await wait(200)
    rerender(<TooltipTest text='' />)
    await wait(1000)
    rerender(<TooltipTest />)
    expect(shownTooltips()).toEqual([])

    // While it shows
    fireEvent.focus(getByText('Testing'))
    expect(shownTooltips()).toEqual(['Tooltip text'])
    rerender(<TooltipTest text='' />)
    rerender(<TooltipTest />)
    expect(shownTooltips()).toEqual([])
    expect(getByText('Testing')).not.toHaveAttribute('aria-describedby')

    // It no longer counts as a tooltip that shows
    await wait(300)
    fireEvent.pointerOver(getByText('Testing'))
    expect(shownTooltips()).toEqual([])
    await flush()
  })

  it('should open at once on the keyboard focus, and close with Escape', async () => {
    const { getByText } = render(<TooltipTest />)
    const target = getByText('Testing')

    fireEvent.focus(target)
    expect(shownTooltips()).toEqual(['Tooltip text'])

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(shownTooltips()).toEqual([])
    expect(target).not.toHaveAttribute('aria-describedby')

    // Escape also stops a tooltip that waits for the pointer
    fireEvent.blur(target)
    await wait(300)
    fireEvent.pointerOver(target)
    fireEvent.keyDown(document, { key: 'Escape' })
    await wait(1000)
    expect(shownTooltips()).toEqual([])
    await flush()
  })

  it.each(['touch', 'pen'])('should open at once on a %s tap and close on a tap elsewhere', async (pointerType) => {
    const { getByText } = render(<Buttons />)

    pointerOver(getByText('B'), pointerType)
    expect(shownTooltips()).toEqual(['Bold'])

    pointerOver(document.body, pointerType)
    expect(shownTooltips()).toEqual([])

    // A mouse that comes later waits again
    await wait(300)
    pointerOver(getByText('I'), 'mouse')
    expect(shownTooltips()).toEqual([])
    await wait(400)
    expect(shownTooltips()).toEqual(['Italic'])
    await flush()
  })
})
