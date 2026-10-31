import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { Carousel } from './Carousel'

// jsdom has no PointerEvent, so the events would lose their coordinates
if (!(window as any).PointerEvent) {
  ;(window as any).PointerEvent = function PointerEvent(type: string, init: any = {}) {
    const event = new MouseEvent(type, init)
    Object.defineProperty(event, 'pointerId', { value: init.pointerId ?? 1 })
    return event
  }
}

const slides = [
  <p key='a'>
    Chairs <a href='/chairs'>See chairs</a>
  </p>,
  <p key='b'>Tables</p>,
  <p key='c'>Lamps</p>,
]

const slideAt = (container: HTMLElement, index: number) =>
  container.querySelectorAll('[aria-roledescription="slide"]')[index]

const currentText = (container: HTMLElement) =>
  container.querySelector('[aria-roledescription="slide"]:not([aria-hidden])').textContent

describe('Carousel', () => {
  it('should render correctly', () => {
    const { container } = render(<Carousel label='Featured products'>{slides}</Carousel>)
    expect(container).toMatchSnapshot()
  })

  it('should describe the carousel and its slides', () => {
    const { container, getByRole } = render(<Carousel label='Featured products'>{slides}</Carousel>)

    expect(getByRole('region', { name: 'Featured products' })).toHaveAttribute('aria-roledescription', 'carousel')
    expect(slideAt(container, 1)).toHaveAttribute('aria-label', '2 of 3')
    expect(slideAt(container, 1)).toHaveAttribute('aria-hidden', 'true')
    expect(slideAt(container, 1)).toHaveAttribute('inert')
    expect(slideAt(container, 0)).not.toHaveAttribute('aria-hidden')
  })

  it('should go back and forth with the arrows and wrap around', () => {
    const onIndexChange = jest.fn()
    const { container, getByRole } = render(
      <Carousel label='Products' onIndexChange={onIndexChange}>
        {slides}
      </Carousel>
    )

    fireEvent.click(getByRole('button', { name: 'Next slide' }))
    expect(currentText(container)).toBe('Tables')
    fireEvent.click(getByRole('button', { name: 'Previous slide' }))
    fireEvent.click(getByRole('button', { name: 'Previous slide' }))
    expect(currentText(container)).toBe('Lamps')
    expect(onIndexChange.mock.calls).toEqual([[1], [0], [2]])
  })

  it('should stop at the ends without loop', () => {
    const { getByRole } = render(
      <Carousel label='Products' loop={false}>
        {slides}
      </Carousel>
    )
    expect(getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    fireEvent.click(getByRole('button', { name: 'Show slide 3 of 3' }))
    expect(getByRole('button', { name: 'Next slide' })).toBeDisabled()
  })

  it('should show a slide from its dot', () => {
    const { container, getByRole } = render(<Carousel label='Products'>{slides}</Carousel>)

    const dot = getByRole('button', { name: 'Show slide 2 of 3' })
    fireEvent.click(dot)
    expect(currentText(container)).toBe('Tables')
    expect(dot).toHaveAttribute('aria-current', 'true')
  })

  it('should change slides by itself, pause with the button and while the pointer is over it', () => {
    jest.useFakeTimers()
    const { container, getByRole } = render(
      <Carousel label='Products' autoPlay interval={1000}>
        {slides}
      </Carousel>
    )
    const track = container.querySelector('[aria-live]')
    expect(track).toHaveAttribute('aria-live', 'off')

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(currentText(container)).toBe('Tables')

    fireEvent.mouseEnter(getByRole('region'))
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(currentText(container)).toBe('Tables')
    expect(track).toHaveAttribute('aria-live', 'polite')
    fireEvent.mouseLeave(getByRole('region'))

    fireEvent.click(getByRole('button', { name: 'Pause slide rotation' }))
    fireEvent.blur(getByRole('button', { name: 'Start slide rotation' }))
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(currentText(container)).toBe('Tables')
    jest.useRealTimers()
  })

  it('should pause while the focus is inside', () => {
    jest.useFakeTimers()
    const { container, getByRole } = render(
      <Carousel label='Products' autoPlay interval={1000}>
        {slides}
      </Carousel>
    )

    fireEvent.focus(getByRole('link', { name: 'See chairs' }))
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(currentText(container)).toBe('Chairs See chairs')
    jest.useRealTimers()
  })

  it('should change slides with a swipe', () => {
    const { container } = render(<Carousel label='Products'>{slides}</Carousel>)
    const viewport = container.querySelector('[aria-live]').parentElement

    fireEvent.pointerDown(viewport, { clientX: 300 })
    fireEvent.pointerUp(viewport, { clientX: 200 })
    expect(currentText(container)).toBe('Tables')

    fireEvent.pointerDown(viewport, { clientX: 200 })
    fireEvent.pointerUp(viewport, { clientX: 230 })
    expect(currentText(container)).toBe('Tables')

    fireEvent.pointerDown(viewport, { clientX: 100 })
    fireEvent.pointerUp(viewport, { clientX: 220 })
    expect(currentText(container)).toBe('Chairs See chairs')
  })

  it('should have no controls for a single slide', () => {
    const { queryByRole } = render(<Carousel label='Products'>{slides[0]}</Carousel>)
    expect(queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Carousel label='Produtos' autoPlay>
          {slides}
        </Carousel>
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Próximo slide' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Pausar a troca de slides' })).toBeInTheDocument()
  })
})
