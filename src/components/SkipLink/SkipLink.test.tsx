import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { SkipLink } from './SkipLink'

describe('SkipLink', () => {
  it('should render correctly', () => {
    const { container } = render(<SkipLink />)
    expect(container).toMatchSnapshot()
  })

  it('should point to the main element by default', () => {
    const { getByRole } = render(<SkipLink />)
    expect(getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main')
  })

  it('should use the target and the text given', () => {
    const { getByRole } = render(<SkipLink target='results'>Skip to results</SkipLink>)
    expect(getByRole('link', { name: 'Skip to results' })).toHaveAttribute('href', '#results')
  })

  it('should translate the default text', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <SkipLink />
      </LocaleContext.Provider>
    )
    expect(getByRole('link', { name: 'Pular para o conteúdo principal' })).toBeInTheDocument()
  })

  it('should move the focus to the target on click', () => {
    const { getByRole } = render(
      <>
        <SkipLink />
        <main id='main'>Content</main>
      </>
    )
    const main = getByRole('main')

    fireEvent.click(getByRole('link'))

    expect(main).toHaveAttribute('tabindex', '-1')
    expect(main).toHaveFocus()
  })

  it('should keep the tabindex of a focusable target', () => {
    const { getByRole } = render(
      <>
        <SkipLink target='search' />
        <input id='search' aria-label='Search' />
      </>
    )

    fireEvent.click(getByRole('link'))

    expect(getByRole('textbox')).not.toHaveAttribute('tabindex')
    expect(getByRole('textbox')).toHaveFocus()
  })

  it('should call onClick and respect preventDefault', () => {
    const onClick = jest.fn((e: React.MouseEvent) => e.preventDefault())
    const { getByRole } = render(
      <>
        <SkipLink onClick={onClick} />
        <main id='main'>Content</main>
      </>
    )

    fireEvent.click(getByRole('link'))

    expect(onClick).toHaveBeenCalled()
    expect(getByRole('main')).not.toHaveFocus()
  })
})
