import React, { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, useStyles } from '../../styles'
import { getComponents } from '../../util/overrides'

import { VFlow } from '../VFlow'
import { VisuallyHidden } from '../VisuallyHidden'
import { useHeight } from '../../hooks/useMeasure'
import { useStepIndex, useStepperContext } from './useStepperContext'
import { StepperDirection } from './Stepper'
import { StepConnector } from './StepConnector'
import { StepContent } from './StepContent'
import { StepLabel } from './StepLabel'
import { StepIcon } from './StepIcon'

export type StepStatus = 'active' | 'completed' | 'incompleted' | 'inactive'

export interface StepProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style' | 'title'> {
  status?: StepStatus
  title: ReactNode
  subtitle?: ReactNode
  style?: ExternalStyles
  overrides?: {
    Root?: ElementType
    Icon?: ElementType
  }
}

export function Step(props: StepProps) {
  const { status = 'incompleted', title, subtitle, overrides, children, style, ...rest } = props
  const { Root } = getComponents(overrides, defaultComponents)

  const locale = useLocale()
  const { direction, getNextStepStatus } = useStepperContext()
  const stepIndex = useStepIndex()
  const { classes, css } = useStyles(() => createStyles(direction))

  const [labelRef, labelHeight] = useHeight()

  const nextStepStatus = getNextStepStatus(stepIndex)
  const isLastStep = nextStepStatus === undefined

  return (
    <Root className={css(classes.step, style)} aria-current={status === 'active' ? 'step' : undefined} {...rest}>
      {!isLastStep && <StepConnector status={nextStepStatus} direction={direction} labelHeight={labelHeight} />}

      <VFlow vSpacing={0}>
        <div className={classes.labelContainer} ref={labelRef}>
          <StepIcon status={status} icon={overrides?.Icon} />
          <StepLabel status={status} title={title} subtitle={subtitle} />
          {/* The icon and the colors show the status on the screen; screen readers say it */}
          <VisuallyHidden>{locale.stepper[status]}</VisuallyHidden>
        </div>

        {children && <StepContent>{children}</StepContent>}
      </VFlow>
    </Root>
  )
}

export const defaultComponents: StepProps['overrides'] = {
  Root: 'span',
  Icon: null,
}

const createStyles = (direction: StepperDirection) => {
  const isHorizontal = direction === 'horizontal'

  return {
    step: {
      position: 'relative',
      textAlign: isHorizontal ? 'center' : 'start',
    } as CSSProperties,
    labelContainer: {
      display: 'flex',
      flexDirection: isHorizontal ? 'column' : 'row',
      alignItems: 'center',
      gap: isHorizontal ? '0.75rem' : '0.5rem',
    } as CSSProperties,
  }
}
