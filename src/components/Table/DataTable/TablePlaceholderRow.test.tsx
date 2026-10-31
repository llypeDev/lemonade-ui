import { render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../../i18n'
import ptBR from '../../../i18n/locales/pt-BR'

import { TablePlaceholderRow } from './TablePlaceholderRow'

it('should render correctly', () => {
  expect(
    render(
      <table>
        <tbody>
          <TablePlaceholderRow colSpan={3} />
        </tbody>
      </table>
    ).container
  ).toMatchSnapshot()

  expect(
    render(
      <table>
        <tbody>
          <TablePlaceholderRow colSpan={2} message='No results' />
        </tbody>
      </table>
    ).container
  ).toMatchSnapshot()
})

it('should take the default message from the locale strings', () => {
  const { getByText, rerender } = render(
    <table>
      <tbody>
        <TablePlaceholderRow colSpan={2} />
      </tbody>
    </table>
  )
  expect(getByText('No results found')).toBeInTheDocument()

  rerender(
    <LocaleContext.Provider value={ptBR}>
      <table>
        <tbody>
          <TablePlaceholderRow colSpan={2} />
        </tbody>
      </table>
    </LocaleContext.Provider>
  )
  expect(getByText('Nenhum registro encontrado')).toBeInTheDocument()
})
