import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { TableOfContents } from './TableOfContents'

jest.mock('../../util/string')

const Page = (props: { offset?: number; withToc?: React.ReactNode }) => (
  <>
    {props.withToc ?? <TableOfContents offset={props.offset} />}
    <main>
      <h2 id='overview'>Overview</h2>
      <h3>Before you start</h3>
      <h2>Ação rápida</h2>
      <h2 id='faq'>FAQ</h2>
    </main>
  </>
)

// Places each heading this many pixels from the top of the window
const placeHeadings = (tops: Record<string, number>) => {
  Object.keys(tops).forEach((id) => {
    document.getElementById(id).getBoundingClientRect = () => ({ top: tops[id] } as DOMRect)
  })
}

// Frames run when the test flushes them, as a browser runs them after the event
let frames: FrameRequestCallback[] = []

const scroll = () =>
  act(() => {
    fireEvent.scroll(window)
    frames.splice(0).forEach((callback) => callback(0))
  })

describe('TableOfContents', () => {
  beforeEach(() => {
    frames = []
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback))
    window.scrollTo = jest.fn()
  })

  afterEach(() => {
    ;(window.requestAnimationFrame as jest.Mock).mockRestore()
  })

  it('should render correctly', () => {
    const { container } = render(<Page />)
    expect(container).toMatchSnapshot()
  })

  it('should list the headings of the page and give ids to those without one', () => {
    const { getByRole } = render(<Page />)
    const nav = getByRole('navigation', { name: 'On this page' })
    const links = Array.from(nav.querySelectorAll('a')).map((link) => [link.textContent, link.getAttribute('href')])

    expect(links).toEqual([
      ['Overview', '#overview'],
      ['Before you start', '#before-you-start'],
      ['Ação rápida', '#acao-rapida'],
      ['FAQ', '#faq'],
    ])
    expect(getByRole('heading', { name: 'Before you start' })).toHaveAttribute('id', 'before-you-start')
  })

  it('should indent the deeper sections', () => {
    const { getByRole } = render(<Page />)
    expect(getByRole('link', { name: 'Overview' })).toHaveStyle({ paddingLeft: '0.75rem' })
    expect(getByRole('link', { name: 'Before you start' })).toHaveStyle({ paddingLeft: '1.75rem' })
  })

  it('should mark the section that reached the top as the page scrolls', () => {
    const { getByRole } = render(<Page offset={64} />)

    // Before any heading reaches the top, the first section is the current one
    placeHeadings({ overview: 120, 'before-you-start': 400, 'acao-rapida': 700, faq: 900 })
    scroll()
    expect(getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'location')

    placeHeadings({ overview: -400, 'before-you-start': -100, 'acao-rapida': 60, faq: 900 })
    scroll()
    expect(getByRole('link', { name: 'Ação rápida' })).toHaveAttribute('aria-current', 'location')
    expect(getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')

    placeHeadings({ overview: -900, 'before-you-start': -600, 'acao-rapida': -300, faq: 40 })
    scroll()
    expect(getByRole('link', { name: 'FAQ' })).toHaveAttribute('aria-current', 'location')
  })

  it('should scroll to a section, focus its heading and mark it', () => {
    const { getByRole } = render(<Page offset={64} />)
    placeHeadings({ overview: 0, 'before-you-start': 200, 'acao-rapida': 500, faq: 900 })

    fireEvent.click(getByRole('link', { name: 'FAQ' }))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 836, behavior: 'smooth' })
    expect(getByRole('heading', { name: 'FAQ' })).toHaveFocus()
    expect(window.location.hash).toBe('#faq')
    expect(getByRole('link', { name: 'FAQ' })).toHaveAttribute('aria-current', 'location')
  })

  it('should accept the sections and a title', () => {
    const { getByRole } = render(
      <Page
        withToc={
          <TableOfContents
            label='Contents'
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'faq', label: 'Questions' },
            ]}
          />
        }
      />
    )
    const nav = getByRole('navigation', { name: 'Contents' })
    expect(nav.querySelectorAll('a')).toHaveLength(2)
    expect(getByRole('link', { name: 'Questions' })).toHaveAttribute('href', '#faq')
  })

  it('should render nothing without sections', () => {
    const { container } = render(<TableOfContents headings='h6' />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Page />
      </LocaleContext.Provider>
    )
    expect(getByRole('navigation', { name: 'Nesta página' })).toBeInTheDocument()
  })
})
