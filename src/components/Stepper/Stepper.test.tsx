import { render } from '@testing-library/react'
import React from 'react'
import { renderToString } from 'react-dom/server'

import { Stepper } from './Stepper'
import { StepperContextValue, useStepperContext } from './useStepperContext'
import { Step } from './Step'

it('should render correctly', () => {
  const { container } = render(<Stepper>Stepper content</Stepper>)
  expect(container).toMatchSnapshot()
})

it('should accept "style" prop', () => {
  const { container } = render(<Stepper style={{ color: 'red' }}>Stepper content</Stepper>)
  expect(container).toMatchSnapshot()
})

it('should allow override of "Root" component', () => {
  const RootOverride = (props) => <span id='root' {...props} />
  const { container } = render(<Stepper overrides={{ Root: RootOverride }}>Stepper content</Stepper>)
  expect(container.querySelector('#root')).toBeTruthy()
  expect(container.querySelector('#root').textContent).toEqual('Stepper content')
})

it('should render with vertical direction and apply correct grid styles', () => {
  const { getByTestId } = render(
    <Stepper direction='vertical' data-testid='stepper'>
      <div />
    </Stepper>
  )

  const stepper = getByTestId('stepper')

  expect(getComputedStyle(stepper).height).toBe('100%')
})

it('should apply gap styles when gap is provided', () => {
  const { getByTestId } = render(
    <Stepper gap={2} data-testid='stepper'>
      <div />
    </Stepper>
  )

  const stepper = getByTestId('stepper')

  expect(getComputedStyle(stepper).gap).toBe('2rem')
})

it('should correctly compute number of steps and template columns', () => {
  const Step = ({ children }: any) => <div>{children}</div>

  const { getByTestId } = render(
    <Stepper direction='horizontal' data-testid='stepper'>
      <Step />
      <Step />
      <Step />
    </Stepper>
  )

  const stepper = getByTestId('stepper')

  expect(getComputedStyle(stepper).gridTemplateColumns).toBe('repeat(3,1fr)')
})

it('should return correct next step status', () => {
  let contextValue!: StepperContextValue

  const Consumer = () => {
    contextValue = useStepperContext()
    return null
  }

  render(
    <Stepper>
      <Step status='active' title='Active step' />
      <Step status='completed' title='Completed step' />
      <Consumer />
    </Stepper>
  )

  // next step of index 0 is status of index 1
  expect(contextValue.getNextStepStatus(0)).toBe('completed')
})

it('should give each step its place among the steps when a step is inserted', () => {
  const Steps = ({ ids }: { ids: string[] }) => (
    <Stepper>
      {ids.map((id) => (
        <Step key={id} title={id} data-testid={id} status={id === 'C' ? 'inactive' : 'completed'} />
      ))}
    </Stepper>
  )

  const { getByTestId, rerender } = render(<Steps ids={['A', 'B', 'C']} />)
  rerender(<Steps ids={['A', 'X', 'B', 'C']} />)
  const connectorOf = (id: string) => getByTestId(id).querySelector<HTMLElement>('[data-testid="step-connector"]')

  expect(connectorOf('X')).not.toBeNull()
  expect(connectorOf('C')).toBeNull()
  expect(getComputedStyle(connectorOf('A')).borderTopStyle).toBe('solid')
  expect(getComputedStyle(connectorOf('X')).borderTopStyle).toBe('solid')
  // The line after B leads to C, which is inactive
  expect(getComputedStyle(connectorOf('B')).borderTopStyle).toBe('dashed')
})

it('should render the steps on the first render, as on the server', () => {
  const html = renderToString(
    <Stepper>
      <Step title='First step' />
      <Step title='Last step' />
    </Stepper>
  )

  expect(html).toContain('First step')
  expect(html).toContain('Last step')
})
