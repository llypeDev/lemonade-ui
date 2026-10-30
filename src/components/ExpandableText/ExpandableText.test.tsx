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
})
