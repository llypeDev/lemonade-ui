import { render, within } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'
import { createMockStepperContext } from '../../test/utils/createMockStepperContext'
import { Step } from './Step'
import { Stepper } from './Stepper'
import { StepperContextProvider } from './useStepperContext'

it('should render correctly when status is incompleted', () => {
  const mockContextValue = createMockStepperContext()

  const { container } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step status='incompleted' title='Incompleted step' />
    </StepperContextProvider>
  )

  expect(container).toMatchSnapshot()
})

it('should render correctly when status is completed', () => {
  const mockContextValue = createMockStepperContext()

  const { container } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step status='completed' title='Completed step' />
    </StepperContextProvider>
  )

  expect(container).toMatchSnapshot()
})

it('should render correctly when status is active', () => {
  const mockContextValue = createMockStepperContext()

  const { container } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step status='active' title='Active step' />
    </StepperContextProvider>
  )

  expect(container).toMatchSnapshot()
})

it('should render correctly when status is inactive', () => {
  const mockContextValue = createMockStepperContext()

  const { container } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step status='inactive' title='Inactive step' />
    </StepperContextProvider>
  )

  expect(container).toMatchSnapshot()
})

it('should accept "style" prop', () => {
  const mockContextValue = createMockStepperContext()

  const { container } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step style={{ color: 'red' }} title='Step red' />
    </StepperContextProvider>
  )

  expect(container).toMatchSnapshot()
})

it('should allow override of components', () => {
  const mockContextValue = createMockStepperContext()
  const RootOverride = (props) => <span id='root' {...props} />
  const IconOverride = (props) => <span id='icon' {...props} />

  const { container } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step
        title='Step with overrides'
        overrides={{
          Root: RootOverride,
          Icon: IconOverride,
        }}
      />
    </StepperContextProvider>
  )
  expect(container).toMatchSnapshot()
})

it('should not render connector when is last step', async () => {
  const { container } = render(
    <Stepper>
      <Step title='First step' data-testid='first-step' />
      <Step title='Second step' data-testid='second-step' />
      <Step title='Last step' data-testid='last-step' />
    </Stepper>
  )

  expect(container.querySelector('[data-testid="first-step"] [data-testid="step-connector"]')).toBeTruthy()
  expect(container.querySelector('[data-testid="second-step"] [data-testid="step-connector"]')).toBeTruthy()
  expect(container.querySelector('[data-testid="last-step"] [data-testid="step-connector"]')).toBeFalsy()
})

it('should tell screen readers the status of each step and mark the current one', () => {
  const steps = (
    <Stepper>
      <Step status='completed' title='Cart' data-testid='cart' />
      <Step status='active' title='Payment' data-testid='payment' />
      <Step title='Review' data-testid='review' />
      <Step status='inactive' title='Gift' data-testid='gift' />
    </Stepper>
  )
  const { getByTestId, rerender } = render(steps)

  expect(getByTestId('payment')).toHaveAttribute('aria-current', 'step')
  expect(getByTestId('cart')).not.toHaveAttribute('aria-current')
  expect(getByTestId('review')).not.toHaveAttribute('aria-current')
  expect(within(getByTestId('cart')).getByText('Completed')).toBeInTheDocument()
  expect(within(getByTestId('payment')).getByText('Current')).toBeInTheDocument()
  expect(within(getByTestId('review')).getByText('Not started')).toBeInTheDocument()
  expect(within(getByTestId('gift')).getByText('Inactive')).toBeInTheDocument()

  rerender(<LocaleContext.Provider value={ptBR}>{steps}</LocaleContext.Provider>)
  expect(within(getByTestId('cart')).getByText('Concluída')).toBeInTheDocument()
  expect(within(getByTestId('payment')).getByText('Atual')).toBeInTheDocument()
  expect(within(getByTestId('review')).getByText('Não iniciada')).toBeInTheDocument()
  expect(within(getByTestId('gift')).getByText('Inativa')).toBeInTheDocument()
})

it('should render children inside StepContent when provided', () => {
  const mockContextValue = createMockStepperContext()

  const { getByTestId } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step title='Parent'>
        <div data-testid='child'>Child</div>
      </Step>
    </StepperContextProvider>
  )

  expect(getByTestId('child')).toBeInTheDocument()
})

it('should apply horizontal layout styles', () => {
  const mockContextValue = createMockStepperContext()

  const { getByTestId } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step title='Horizontal step' data-testid='horizontal-step' />
    </StepperContextProvider>
  )

  const step = getByTestId('horizontal-step')

  expect(getComputedStyle(step).textAlign).toBe('center')
})

it('should apply vertical layout styles when direction is vertical', () => {
  const mockContextValue = createMockStepperContext({ direction: 'vertical' })

  const { getByTestId } = render(
    <StepperContextProvider value={mockContextValue}>
      <Step title='Vertical step' data-testid='vertical-step' />
    </StepperContextProvider>
  )

  const step = getByTestId('vertical-step')

  expect(getComputedStyle(step).textAlign).toBe('start')
})
