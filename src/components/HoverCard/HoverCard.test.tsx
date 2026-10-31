import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { HoverCard } from './HoverCard'

jest.mock('../../util/string')

const renderCard = (onMouseEnter?: () => void) =>
  render(
    <HoverCard content={<p>Ana Souza, product designer in São Paulo</p>}>
      <a href='/people/ana' onMouseEnter={onMouseEnter}>
        Ana Souza
      </a>
    </HoverCard>
  )

// Timers and Popper both update the card, so each step waits inside act
const advance = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms)
  })
}

describe('HoverCard', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('should render correctly when open', async () => {
    const { getByRole } = renderCard()
    fireEvent.mouseEnter(getByRole('link'))
    await advance(500)
    expect(document.body).toMatchSnapshot()
  })

  it('should show the card after the pointer rests on the element', async () => {
    const { getByRole, queryByText } = renderCard()
    const link = getByRole('link', { name: 'Ana Souza' })

    fireEvent.mouseEnter(link)
    await advance(300)
    expect(queryByText(/product designer/)).not.toBeInTheDocument()

    await advance(200)
    expect(queryByText(/product designer/)).toBeInTheDocument()
    expect(link).toHaveAttribute('aria-describedby', queryByText(/product designer/).parentElement.id)
  })

  it('should not show the card when the pointer only passes by', async () => {
    const { getByRole, queryByText } = renderCard()
    const link = getByRole('link')

    fireEvent.mouseEnter(link)
    await advance(200)
    fireEvent.mouseLeave(link)
    await advance(1000)
    expect(queryByText(/product designer/)).not.toBeInTheDocument()
  })

  it('should stay open while the pointer moves into the card', async () => {
    const { getByRole, getByText, queryByText } = renderCard()
    const link = getByRole('link')

    fireEvent.mouseEnter(link)
    await advance(500)
    fireEvent.mouseLeave(link)
    await advance(100)
    fireEvent.mouseEnter(getByText(/product designer/).parentElement)
    await advance(1000)
    expect(queryByText(/product designer/)).toBeInTheDocument()

    fireEvent.mouseLeave(getByText(/product designer/).parentElement)
    await advance(300)
    expect(queryByText(/product designer/)).not.toBeInTheDocument()
  })

  it('should show on focus and hide with Escape', async () => {
    const { getByRole, queryByText } = renderCard()
    const link = getByRole('link')

    fireEvent.focus(link)
    await advance(500)
    expect(queryByText(/product designer/)).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(queryByText(/product designer/)).not.toBeInTheDocument()
    expect(link).not.toHaveAttribute('aria-describedby')
  })

  it('should keep the handlers of the element', () => {
    const onMouseEnter = jest.fn()
    const { getByRole } = renderCard(onMouseEnter)
    fireEvent.mouseEnter(getByRole('link'))
    expect(onMouseEnter).toHaveBeenCalledTimes(1)
  })
})
