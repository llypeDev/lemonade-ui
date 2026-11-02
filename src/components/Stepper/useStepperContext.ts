import { createContext, useContext } from 'react'
import { StepperDirection } from './Stepper'
import { StepStatus } from './Step'

export interface StepperContextValue {
  direction: StepperDirection
  gap: number | undefined
  getNextStepStatus: (currentIndex: number) => StepStatus | undefined
}

const StepperContext = createContext<StepperContextValue | undefined>(undefined)

export const StepperContextProvider = StepperContext.Provider

// Position of a step among the steps of its Stepper, given by the Stepper to each of its children
const StepIndexContext = createContext(0)

export const StepIndexProvider = StepIndexContext.Provider

export const useStepIndex = () => useContext(StepIndexContext)

export function useStepperContext() {
  const context = useContext(StepperContext)

  if (!context) {
    throw new Error(
      'Stepper subcomponents (like Step, StepLabel, StepConnector and StepContent) must be used inside <Stepper>'
    )
  }

  return context
}
