import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'
import { DropdownItem } from '../Dropdown'

import { SplitButton } from './SplitButton'

jest.mock('../../util/string')

// Popper places the menu asynchronously, so each opening waits for it inside act
const flush = () => act(async () => undefined)

const renderButton = (props: { onSave?(): void; onDraft?(): void; disabled?: boolean } = {}) =>
  render(
    <SplitButton
      kind='primary'
      onClick={props.onSave}
      disabled={props.disabled}
      menuLabel='More ways to save'
      menu={
        <>
          <DropdownItem onClick={props.onDraft}>Save as draft</DropdownItem>
          <DropdownItem>Save and close</DropdownItem>
        </>
      }
    >
      Save
    </SplitButton>
  )

describe('SplitButton', () => {
  it('should render correctly', () => {
    const { container } = renderButton()
    expect(container).toMatchSnapshot()
  })

  it('should run the main action', () => {
    const onSave = jest.fn()
    const { getByRole, queryByRole } = renderButton({ onSave })

    fireEvent.click(getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should open the menu of related actions and run one', async () => {
    const onDraft = jest.fn()
    const { getByRole, queryByRole } = renderButton({ onDraft })
    const toggle = getByRole('button', { name: 'More ways to save' })

    expect(toggle).toHaveAttribute('aria-haspopup', 'true')
    fireEvent.click(toggle)
    await flush()
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(getByRole('menuitem', { name: 'Save as draft' }))
    expect(onDraft).toHaveBeenCalledTimes(1)
    expect(queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should disable both buttons', () => {
    const { getByRole } = renderButton({ disabled: true })
    expect(getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(getByRole('button', { name: 'More ways to save' })).toBeDisabled()
  })

  it('should name the menu button from the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <SplitButton menu={<DropdownItem>Salvar como rascunho</DropdownItem>}>Salvar</SplitButton>
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Mais opções' })).toBeInTheDocument()
  })
})
