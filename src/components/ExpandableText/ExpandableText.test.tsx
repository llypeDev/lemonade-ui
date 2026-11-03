import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { ExpandableText } from './ExpandableText'

jest.mock('../../util/string')

const text = 'Lemonade is a design system with React components, a Storybook and a documentation site.'

// jsdom has no layout, so the heights tell whether the text overflows
const mockOverflow = (overflowing: boolean) => {
  jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(overflowing ? 120 : 60)
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(60)
}

afterEach(() => jest.restoreAllMocks())

describe('ExpandableText', () => {
  it('should render correctly', () => {
    mockOverflow(true)
    const { container } = render(<ExpandableText lines={2}>{text}</ExpandableText>)
    expect(container).toMatchSnapshot()
  })

  it('should not show the button when the text fits', () => {
    mockOverflow(false)
    const { queryByRole } = render(<ExpandableText>{text}</ExpandableText>)
    expect(queryByRole('button')).toBeNull()
  })

  it('should expand and collapse the text', () => {
    mockOverflow(true)
    const onExpandedChange = jest.fn()
    const { getByRole, getByText } = render(<ExpandableText onExpandedChange={onExpandedChange}>{text}</ExpandableText>)
    const button = getByRole('button', { name: 'Show more' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls', getByText(text).id)

    fireEvent.click(button)
    expect(onExpandedChange).toHaveBeenLastCalledWith(true)
    expect(getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(getByRole('button'))
    expect(getByRole('button', { name: 'Show more' })).toBeInTheDocument()
  })

  it('should keep the button of an expanded text that no longer overflows', () => {
    mockOverflow(false)
    const { getByRole } = render(<ExpandableText defaultExpanded>{text}</ExpandableText>)
    expect(getByRole('button', { name: 'Show less' })).toBeInTheDocument()
  })

  it('should follow the expanded prop and use the labels given', () => {
    mockOverflow(true)
    const { getByRole, rerender } = render(
      <ExpandableText expanded={false} moreLabel='Read the whole review'>
        {text}
      </ExpandableText>
    )

    fireEvent.click(getByRole('button', { name: 'Read the whole review' }))
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false')

    rerender(
      <ExpandableText expanded lessLabel='Hide'>
        {text}
      </ExpandableText>
    )
    expect(getByRole('button', { name: 'Hide' })).toBeInTheDocument()
  })

  it('should translate the default labels', () => {
    mockOverflow(true)
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <ExpandableText>{text}</ExpandableText>
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Ver mais' })).toBeInTheDocument()
  })

  describe('expand and collapse', () => {
    const { matchMedia } = window
    afterEach(() => {
      window.matchMedia = matchMedia
    })
    const prefersReducedMotion = (reduce: boolean) => {
      window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
    }

    const isClamped = (element: HTMLElement) => window.getComputedStyle(element).display === '-webkit-box'
    // jsdom has no layout: the text takes 120px, and its clamped lines 60px
    const heightOf = (element: HTMLElement) =>
      element.style.height ? parseFloat(element.style.height) : isClamped(element) ? 60 : 120
    const mockLayout = () => {
      jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(120)
      jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
        return heightOf(this)
      })
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        return { height: heightOf(this) } as DOMRect
      })
    }
    // The heights the element goes through, in order
    const watchHeights = (element: HTMLElement) => {
      const setHeight = jest.spyOn(CSSStyleDeclaration.prototype, 'height', 'set')
      return () =>
        setHeight.mock.calls
          .filter((_, i) => (setHeight.mock.instances[i] as unknown) === element.style)
          .map(([height]) => height)
    }

    it('should slide from the clamped lines to the whole text', () => {
      prefersReducedMotion(false)
      mockLayout()
      const { getByRole, getByText } = render(<ExpandableText>{text}</ExpandableText>)
      const content = getByText(text)
      const heights = watchHeights(content)

      fireEvent.click(getByRole('button', { name: 'Show more' }))
      expect(isClamped(content)).toBe(false)
      expect(heights()).toEqual(['60px', '120px'])
      expect(content.style.transition).toBe('height 200ms ease')

      fireEvent.transitionEnd(content)
      expect(content.style.height).toBe('')
      expect(isClamped(content)).toBe(false)
    })

    it('should keep the whole text while it slides back to the clamped lines, and clamp it at the end', () => {
      prefersReducedMotion(false)
      mockLayout()
      const { getByRole, getByText } = render(<ExpandableText defaultExpanded>{text}</ExpandableText>)
      const content = getByText(text)
      const heights = watchHeights(content)

      fireEvent.click(getByRole('button', { name: 'Show less' }))
      expect(getByRole('button', { name: 'Show more' })).toHaveAttribute('aria-expanded', 'false')
      expect(isClamped(content)).toBe(false)
      expect(heights()).toEqual(['120px', '60px'])

      fireEvent.transitionEnd(content)
      expect(isClamped(content)).toBe(true)
      expect(content.style.height).toBe('')
    })

    it('should clamp the text at once with reduced motion', () => {
      prefersReducedMotion(true)
      mockLayout()
      const { getByRole, getByText } = render(<ExpandableText defaultExpanded>{text}</ExpandableText>)

      fireEvent.click(getByRole('button', { name: 'Show less' }))
      expect(isClamped(getByText(text))).toBe(true)
      expect(getByText(text).style.height).toBe('')
    })

    it.each([
      ['with', false],
      ['without', true],
    ])('should keep the focus on the button when the text expands and collapses, %s motion', (_, reduce) => {
      prefersReducedMotion(reduce)
      mockLayout()
      const { getByRole, getByText } = render(<ExpandableText>{text}</ExpandableText>)
      const button = getByRole('button', { name: 'Show more' })

      button.focus()
      fireEvent.click(button)
      fireEvent.transitionEnd(getByText(text))
      expect(button).toHaveTextContent('Show less')
      expect(button).toHaveFocus()

      // The button stays the same element, so the focus is not lost
      fireEvent.click(button)
      fireEvent.transitionEnd(getByText(text))
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Show more')
      expect(button).toHaveFocus()
    })
  })
})
