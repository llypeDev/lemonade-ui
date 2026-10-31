import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { BackToTop } from './BackToTop'

const scrollWindow = (y: number) =>
  act(() => {
    Object.defineProperty(window, 'pageYOffset', { value: y, configurable: true })
    fireEvent.scroll(window)
  })

describe('BackToTop', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn()
    Object.defineProperty(window, 'pageYOffset', { value: 0, configurable: true })
  })

  it('should render correctly', () => {
    const { container } = render(<BackToTop />)
    scrollWindow(800)
    expect(container).toMatchSnapshot()
  })

  it('should show only after the page scrolls past the threshold', () => {
    const { queryByRole } = render(<BackToTop threshold={300} />)
    expect(queryByRole('button')).not.toBeInTheDocument()

    scrollWindow(200)
    expect(queryByRole('button')).not.toBeInTheDocument()

    scrollWindow(350)
    expect(queryByRole('button', { name: 'Back to top' })).toBeInTheDocument()

    scrollWindow(0)
    expect(queryByRole('button')).not.toBeInTheDocument()
  })

  it('should scroll to the top and move the focus to the main heading', () => {
    const { getByRole } = render(
      <>
        <h1>Orders</h1>
        <BackToTop />
      </>
    )
    scrollWindow(900)
    fireEvent.click(getByRole('button', { name: 'Back to top' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(getByRole('heading', { name: 'Orders' })).toHaveFocus()
  })

  it('should skip a hidden heading', () => {
    const { getByText, getByRole } = render(
      <>
        <h1 hidden>Menu</h1>
        <h1>Orders</h1>
        <BackToTop />
      </>
    )
    const visible = getByText('Orders')
    visible.getClientRects = () => ([{}] as any) as DOMRectList
    scrollWindow(900)
    fireEvent.click(getByRole('button', { name: 'Back to top' }))
    expect(visible).toHaveFocus()
  })

  it('should follow a scroll container and another focus target', () => {
    const container = document.createElement('div')
    container.scrollTo = jest.fn()
    const { getByRole } = render(
      <>
        <a id='start' href='#start'>
          Start
        </a>
        <BackToTop scrollContainer={container} focusTarget='#start' />
      </>
    )

    act(() => {
      Object.defineProperty(container, 'scrollTop', { value: 600, configurable: true })
      fireEvent.scroll(container)
    })
    fireEvent.click(getByRole('button'))
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(getByRole('link', { name: 'Start' })).toHaveFocus()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <BackToTop threshold={0} />
      </LocaleContext.Provider>
    )
    scrollWindow(10)
    expect(getByRole('button', { name: 'Voltar ao topo' })).toBeInTheDocument()
  })
})
