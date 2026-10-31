import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { Toggletip } from './Toggletip'

jest.mock('../../util/string')

// Popper places the popover asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

describe('Toggletip', () => {
  it('should render correctly when open', async () => {
    const { container, getByRole } = render(
      <Toggletip label='About the plans'>
        Plans can be changed at any time. <a href='/plans'>Compare plans</a>
      </Toggletip>
    )
    fireEvent.click(getByRole('button'))
    await flush()
    expect(container).toMatchSnapshot()
  })

  it('should show the explanation on click and hide it on a second click', async () => {
    const { getByRole, queryByRole } = render(<Toggletip label='About the plans'>Plans can change.</Toggletip>)
    const button = getByRole('button', { name: 'About the plans' })

    expect(queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(button)
    await flush()
    expect(getByRole('dialog')).toHaveTextContent('Plans can change.')
    expect(button).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(button)
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should move the focus to a link inside and close with Escape', async () => {
    const { getByRole, queryByRole } = render(
      <Toggletip label='About the plans'>
        <a href='/plans'>Compare plans</a>
      </Toggletip>
    )
    const button = getByRole('button')

    button.focus()
    fireEvent.click(button)
    await flush()
    expect(getByRole('link', { name: 'Compare plans' })).toHaveFocus()

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(queryByRole('dialog')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Toggletip>Texto</Toggletip>
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Mais informações' })).toBeInTheDocument()
  })
})
