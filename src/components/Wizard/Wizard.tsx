import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { isPromise } from '../../util'
import { randomStr } from '../../util/string'
import { Button } from '../Button'
import { Step, Stepper } from '../Stepper'

export interface WizardStep {
  /**
   * Unique id of the step
   */
  id: string

  title: string

  content: React.ReactNode

  /**
   * Checks the step before going forward. Return `false` to stay, and show what is wrong in the step itself.
   * A promise keeps the next button busy until it resolves.
   */
  validate?(): boolean | Promise<boolean>
}

export interface WizardProps {
  steps: WizardStep[]

  /**
   * Index of the current step, for a controlled wizard
   */
  step?: number

  /**
   * Step an uncontrolled wizard starts on
   * @default 0
   */
  defaultStep?: number

  /**
   * Called with the index of the new step when the user goes back or forward
   */
  onStepChange?(step: number): void

  /**
   * Called by the button of the last step, after its validation. A promise keeps the button busy.
   */
  onFinish(): void | Promise<unknown>

  /**
   * Text of the button of the last step, such as "Create account"
   * @default "Finish", from the locale strings
   */
  finishLabel?: React.ReactNode

  /**
   * Shows the steps above the content
   * @default true
   */
  showStepper?: boolean

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

/**
 * A long form split in steps, such as signing up or placing an order, with back and next buttons, a check of
 * each step before going forward and the steps shown above. Keep the values of the form outside the steps, since
 * only the current step is on the page.
 */
export function Wizard(props: WizardProps) {
  const { steps, step, defaultStep = 0, onStepChange, onFinish, finishLabel, showStepper = true, style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const isMounted = useIsMounted()
  const [internalStep, setInternalStep] = useState(defaultStep)
  const [busy, setBusy] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const headingId = useMemo(() => `wizard-${randomStr()}`, [])

  const index = Math.max(0, Math.min(steps.length - 1, step ?? internalStep))
  const current = steps[index]
  const isLast = index === steps.length - 1

  // A new step takes the focus on its title, so screen readers say where the user is
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current && headingRef.current.focus()
  }, [index])

  const goTo = (next: number) => {
    if (step === undefined) {
      setInternalStep(next)
    }
    onStepChange && onStepChange(next)
  }

  // Runs an action, waiting for its promise; a result of `false` stops what comes after
  const run = (action: () => unknown, after?: () => void) => {
    const result = action()
    if (isPromise(result)) {
      setBusy(true)
      result.then(
        (value) => {
          if (isMounted.current) {
            setBusy(false)
            value !== false && after && after()
          }
        },
        () => isMounted.current && setBusy(false)
      )
      return
    }
    result !== false && after && after()
  }

  const handleNext = () => {
    if (busy) {
      return
    }
    const finish = () => (isLast ? run(onFinish) : goTo(index + 1))
    if (current.validate) {
      run(current.validate, finish)
    } else {
      finish()
    }
  }

  const statusOf = (stepIndex: number) =>
    stepIndex < index ? 'completed' : stepIndex === index ? 'active' : 'incompleted'

  return (
    <div className={css(classes.root, style)}>
      {showStepper && (
        <Stepper>
          {steps.map((item, stepIndex) => (
            <Step key={item.id} title={item.title} status={statusOf(stepIndex)} />
          ))}
        </Stepper>
      )}

      <section aria-labelledby={headingId} className={classes.panel}>
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className={classes.heading}>
          <span className={classes.progress}>
            {fill(locale.wizard.step, { current: index + 1, total: steps.length })}
          </span>
          <span className={classes.title}>{current.title}</span>
        </h2>
        <div key={current.id}>{current.content}</div>
      </section>

      <div className={classes.footer}>
        {index > 0 && (
          <Button disabled={busy} onClick={() => goTo(index - 1)}>
            {locale.wizard.back}
          </Button>
        )}
        <span className={classes.spacer} />
        <Button kind='primary' loading={busy} onClick={handleNext}>
          {isLast ? finishLabel ?? locale.wizard.finish : locale.wizard.next}
        </Button>
      </div>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  } as CSSProperties,
  panel: {
    minWidth: 0,
  } as CSSProperties,
  heading: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 0 1rem',
    outline: 'none',
    borderRadius: theme.radius.input,
    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  progress: {
    color: theme.pallete.text.secondary,
    fontSize: '0.875rem',
    fontWeight: 'normal',
  } as CSSProperties,
  title: {
    ...theme.typography.variant('h3'),
  } as CSSProperties,
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  spacer: {
    flex: 1,
  } as CSSProperties,
})
