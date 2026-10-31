import { Placement } from '@popperjs/core'
import React, { CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePopper } from 'react-popper'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'
import { Button } from '../Button'
import { Portal } from '../Portal'

export type TourTarget = string | React.RefObject<HTMLElement> | (() => HTMLElement | null)

export interface TourStep {
  /**
   * The part of the page the step points to: a CSS selector, a ref or a function that returns the element.
   * Without it, or when the element is not on the page, the step shows in the middle of the screen.
   */
  target?: TourTarget

  title: React.ReactNode

  /**
   * What the part does and why it matters, in a sentence or two
   */
  content?: React.ReactNode

  /**
   * Side of the target where the step shows. It moves to another side when there is no room.
   * @default 'bottom'
   */
  placement?: Placement
}

export type TourCloseReason = 'skip' | 'done'

export interface TourProps {
  steps: TourStep[]

  open: boolean

  /**
   * Called when the user skips the tour, with the skip button or `Escape`, or finishes it on the last step
   */
  onClose(reason: TourCloseReason): void

  /**
   * Index of the current step, for a controlled tour
   */
  step?: number

  /**
   * Step an uncontrolled tour starts on each time it opens
   * @default 0
   */
  defaultStep?: number

  /**
   * Called with the index of the new step when the user goes back or forward
   */
  onStepChange?(step: number): void

  /**
   * Styles of the step
   */
  style?: ExternalStyles
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

// Space between the target and the edge of the spotlight, in pixels
const spotlightPadding = 4

const resolveTarget = (target: TourTarget): HTMLElement | null => {
  if (!target) {
    return null
  }
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target)
  }
  if (typeof target === 'function') {
    return target()
  }
  return target.current
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

/**
 * A guided tour of a screen: steps that point to its parts one at a time, with a spotlight on each part,
 * to introduce a new screen or feature. The page stays usable while the tour is open.
 */
export function Tour(props: TourProps) {
  const { steps, open, onClose, step, defaultStep = 0, onStepChange, style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [internalStep, setInternalStep] = useState(defaultStep)
  const [target, setTarget] = useState<HTMLElement>(null)
  const [rect, setRect] = useState<Rect>(null)
  const [dialogRef, setDialogRef] = useState<HTMLDivElement>(null)
  const [arrowRef, setArrowRef] = useState<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement>(null)
  const ids = useMemo(() => {
    const id = randomStr()
    return { title: `tour-title-${id}`, content: `tour-content-${id}` }
  }, [])

  const index = Math.max(0, Math.min(steps.length - 1, step ?? internalStep))
  const current = steps[index]
  const isLast = index === steps.length - 1
  const visible = open && !!current

  const {
    styles: { popper: popperStyle, arrow: arrowStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(target, dialogRef, {
    placement: (current && current.placement) || 'bottom',
    strategy: 'fixed',
    modifiers: [
      { name: 'offset', options: { offset: [0, 12 + spotlightPadding] } },
      { name: 'preventOverflow', options: { padding: 8 } },
      { name: 'arrow', options: { element: arrowRef, padding: 8 } },
    ],
  })

  // An uncontrolled tour starts again each time it opens; the focus goes back where it was when it closes
  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement
      setInternalStep(defaultStep)
    } else if (returnFocus.current) {
      const element = returnFocus.current
      returnFocus.current = null
      element.focus && document.contains(element) && element.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Finds the target of the step and brings it into view
  useLayoutEffect(() => {
    const element = visible ? resolveTarget(current.target) : null
    setTarget(element)

    if (element && element.scrollIntoView) {
      const bounds = element.getBoundingClientRect()
      const inView = bounds.top >= 0 && bounds.bottom <= window.innerHeight
      !inView && element.scrollIntoView({ block: 'center', inline: 'nearest' })
    }
  }, [visible, current])

  // Keeps the spotlight on the target while the page scrolls or resizes
  useLayoutEffect(() => {
    if (!target) {
      setRect(null)
      return
    }

    let frame: number = null
    const measure = () => {
      const bounds = target.getBoundingClientRect()
      setRect({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height })
    }
    const schedule = () => {
      if (frame === null) {
        frame = requestAnimationFrame(() => {
          frame = null
          measure()
        })
      }
    }

    measure()
    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    return () => {
      frame !== null && cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
    }
  }, [target])

  // Each step takes the focus, so screen readers read its title and text
  useEffect(() => {
    if (visible && dialogRef) {
      dialogRef.focus({ preventScroll: true })
    }
  }, [visible, dialogRef, index])

  useEffect(() => {
    if (!visible) {
      return
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose('skip')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible, onClose])

  if (!visible) {
    return null
  }

  const goTo = (next: number) => {
    if (step === undefined) {
      setInternalStep(next)
    }
    onStepChange && onStepChange(next)
  }

  const handleNext = () => (isLast ? onClose('done') : goTo(index + 1))
  const anchored = !!target

  return (
    <Portal>
      <div
        aria-hidden
        className={css(classes.spotlight, !rect && classes.dim)}
        style={
          rect
            ? {
                top: rect.top - spotlightPadding,
                left: rect.left - spotlightPadding,
                width: rect.width + spotlightPadding * 2,
                height: rect.height + spotlightPadding * 2,
              }
            : undefined
        }
      />
      <div
        ref={setDialogRef}
        role='dialog'
        aria-labelledby={ids.title}
        aria-describedby={current.content ? ids.content : undefined}
        tabIndex={-1}
        className={css(classes.dialog, !anchored && classes.centered, style)}
        style={anchored ? popperStyle : undefined}
        {...(anchored ? popperAttributes : {})}
      >
        {anchored && <div ref={setArrowRef} className={classes.arrow} style={arrowStyle} data-popper-arrow />}
        <p className={classes.progress}>{fill(locale.tour.step, { current: index + 1, total: steps.length })}</p>
        <h2 id={ids.title} className={classes.title}>
          {current.title}
        </h2>
        {current.content && (
          <div id={ids.content} className={classes.content}>
            {current.content}
          </div>
        )}
        <div className={classes.footer}>
          {!isLast && (
            <Button size='small' skin='ghost' style={classes.skip} onClick={() => onClose('skip')}>
              {locale.tour.skip}
            </Button>
          )}
          <span className={classes.spacer} />
          {index > 0 && (
            <Button size='small' onClick={() => goTo(index - 1)}>
              {locale.tour.back}
            </Button>
          )}
          <Button size='small' kind='primary' onClick={handleNext}>
            {isLast ? locale.tour.done : locale.tour.next}
          </Button>
        </div>
      </div>
    </Portal>
  )
}

const arrowSize = 12

const createStyles = (theme: Theme) => ({
  spotlight: {
    position: 'fixed',
    zIndex: theme.zIndex.dropdown,
    borderRadius: theme.radius.paper,
    // The shadow darkens the whole page around the target
    boxShadow: '0 0 0 100vmax rgba(0, 0, 0, 0.5)',
    pointerEvents: 'none',
    transition: 'top .2s, left .2s, width .2s, height .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  dim: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    boxShadow: 'none',
    background: 'rgba(0, 0, 0, 0.5)',
  } as CSSProperties,
  dialog: {
    ...theme.typography.variant('main'),
    zIndex: theme.zIndex.dropdown + 1,
    boxSizing: 'border-box',
    width: '20rem',
    maxWidth: 'calc(100vw - 2rem)',
    padding: '1rem',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.popper,
    background: theme.pallete.surface.main,
    boxShadow: theme.shadows.outer[40],
    outline: 'none',
    '&[data-popper-placement^="bottom"] > [data-popper-arrow]': {
      top: -arrowSize / 2 - 1,
      '&::before': { borderRightColor: 'transparent', borderBottomColor: 'transparent' },
    },
    '&[data-popper-placement^="top"] > [data-popper-arrow]': {
      bottom: -arrowSize / 2 - 1,
      '&::before': { borderLeftColor: 'transparent', borderTopColor: 'transparent' },
    },
    '&[data-popper-placement^="left"] > [data-popper-arrow]': {
      right: -arrowSize / 2 - 1,
      '&::before': { borderLeftColor: 'transparent', borderBottomColor: 'transparent' },
    },
    '&[data-popper-placement^="right"] > [data-popper-arrow]': {
      left: -arrowSize / 2 - 1,
      '&::before': { borderRightColor: 'transparent', borderTopColor: 'transparent' },
    },
  } as CSSProperties,
  centered: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  } as CSSProperties,
  arrow: {
    width: arrowSize,
    height: arrowSize,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      boxSizing: 'border-box',
      width: arrowSize,
      height: arrowSize,
      border: `1px solid ${theme.pallete.divider}`,
      background: theme.pallete.surface.main,
      transform: 'rotate(45deg)',
    },
  } as CSSProperties,
  progress: {
    margin: 0,
    color: theme.pallete.text.secondary,
    fontSize: '0.75rem',
  } as CSSProperties,
  title: {
    ...theme.typography.variant('h4'),
    margin: '0.25rem 0 0',
  } as CSSProperties,
  content: {
    marginTop: '0.5rem',
  } as CSSProperties,
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  } as CSSProperties,
  skip: {
    // Lines the text of the button up with the text of the step
    marginLeft: '-0.5rem',
  } as CSSProperties,
  spacer: {
    flex: 1,
  } as CSSProperties,
})
