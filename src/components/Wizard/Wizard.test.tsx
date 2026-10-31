import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { Wizard, WizardStep } from './Wizard'

jest.mock('../../util/string')

const steps = (validate?: WizardStep['validate']): WizardStep[] => [
  { id: 'account', title: 'Account', content: <p>Email and password</p>, validate },
  { id: 'plan', title: 'Plan', content: <p>Pick a plan</p> },
  { id: 'payment', title: 'Payment', content: <p>Card details</p> },
]

describe('Wizard', () => {
  it('should render correctly', () => {
    const { container } = render(<Wizard steps={steps()} onFinish={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  it('should show the current step with its position', () => {
    const { getByRole, queryByRole, getByText } = render(<Wizard steps={steps()} onFinish={jest.fn()} />)

    expect(getByRole('region', { name: 'Step 1 of 3 Account' })).toBeInTheDocument()
    expect(getByText('Email and password')).toBeInTheDocument()
    expect(queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    expect(getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('should go forward and back, moving the focus to the title of the step', () => {
    const onStepChange = jest.fn()
    const { getByRole, getByText } = render(<Wizard steps={steps()} onFinish={jest.fn()} onStepChange={onStepChange} />)

    fireEvent.click(getByRole('button', { name: 'Next' }))
    expect(getByText('Pick a plan')).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Step 2 of 3 Plan' })).toHaveFocus()

    fireEvent.click(getByRole('button', { name: 'Back' }))
    expect(getByText('Email and password')).toBeInTheDocument()
    expect(onStepChange.mock.calls).toEqual([[1], [0]])
  })

  it('should not move the focus on the first render', () => {
    render(<Wizard steps={steps()} onFinish={jest.fn()} />)
    expect(document.body).toHaveFocus()
  })

  it('should stay on a step that does not pass its check', () => {
    const validate = jest.fn(() => false)
    const { getByRole, getByText } = render(<Wizard steps={steps(validate)} onFinish={jest.fn()} />)

    fireEvent.click(getByRole('button', { name: 'Next' }))
    expect(validate).toHaveBeenCalledTimes(1)
    expect(getByText('Email and password')).toBeInTheDocument()
  })

  it('should wait for an asynchronous check', async () => {
    let resolve: (value: boolean) => void
    const validate = () => new Promise<boolean>((done) => (resolve = done))
    const { getByRole, getByText } = render(<Wizard steps={steps(validate)} onFinish={jest.fn()} />)

    fireEvent.click(getByRole('button', { name: 'Next' }))
    expect(getByText('Email and password')).toBeInTheDocument()

    await act(async () => resolve(true))
    expect(getByText('Pick a plan')).toBeInTheDocument()
  })

  it('should finish on the last step with its own label', async () => {
    const onFinish = jest.fn()
    const { getByRole } = render(
      <Wizard steps={steps()} defaultStep={2} onFinish={onFinish} finishLabel='Create account' />
    )

    fireEvent.click(getByRole('button', { name: 'Create account' }))
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('should follow a controlled step', () => {
    const { getByText, rerender } = render(<Wizard steps={steps()} step={0} onFinish={jest.fn()} />)
    rerender(<Wizard steps={steps()} step={2} onFinish={jest.fn()} />)
    expect(getByText('Card details')).toBeInTheDocument()
  })

  it('should hide the stepper', () => {
    const { container } = render(<Wizard steps={steps()} onFinish={jest.fn()} showStepper={false} />)
    expect(container).not.toHaveTextContent('AccountPlanPayment')
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Wizard steps={steps()} defaultStep={1} onFinish={jest.fn()} />
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Avançar' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Etapa 2 de 3 Plan' })).toBeInTheDocument()
  })
})
