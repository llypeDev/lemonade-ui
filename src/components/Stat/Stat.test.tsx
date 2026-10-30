import { render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { Stat } from './Stat'

describe('Stat', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Stat label='Revenue' value='R$ 12.430' change={12.5} description='vs last month' icon='walletOutline' />
    )
    expect(container).toMatchSnapshot()
  })

  it('should show the label, the value and the description', () => {
    const { container } = render(<Stat label='Orders' value='1,042' change={3} description='vs last week' />)
    expect(container).toHaveTextContent('Orders1,042Up 3%vs last week')
  })

  it('should tell screen readers the direction of the change', () => {
    const { getByText, rerender } = render(<Stat label='Orders' value='980' change={-2.25} />)
    expect(getByText('Down', { exact: false })).toBeInTheDocument()
    expect(getByText('2.3%')).toBeInTheDocument()

    rerender(<Stat label='Orders' value='980' change={0} />)
    expect(getByText('No change', { exact: false })).toBeInTheDocument()
  })

  it('should show an increase as good and a decrease as bad', () => {
    const { container, rerender } = render(<Stat label='Revenue' value='10' change={5} />)
    const goodClass = container.querySelector('svg').parentElement.className

    rerender(<Stat label='Revenue' value='10' change={-5} />)
    const badClass = container.querySelector('svg').parentElement.className
    expect(badClass).not.toBe(goodClass)

    rerender(<Stat label='Costs' value='10' change={-5} lowerIsBetter />)
    expect(container.querySelector('svg').parentElement.className).toBe(goodClass)
  })

  it('should format the change with formatChange', () => {
    const { getByText } = render(<Stat label='Visits' value='12k' change={40} formatChange={(v) => `${v} pts`} />)
    expect(getByText('40 pts')).toBeInTheDocument()
  })

  it('should not show a change without one', () => {
    const { container } = render(<Stat label='Customers' value='318' />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('should translate the direction', () => {
    const { container } = render(
      <LocaleContext.Provider value={ptBR}>
        <Stat label='Receita' value='R$ 10' change={8} />
      </LocaleContext.Provider>
    )
    expect(container).toHaveTextContent('Alta de 8%')
  })
})
