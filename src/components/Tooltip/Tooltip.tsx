import { Options as PopperOptions } from '@popperjs/core'
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePopper } from 'react-popper'
import { useTransition } from '../../hooks/useTransition'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'
import { Portal } from '../Portal'
import { RootRef } from '../RootRef'
import { TooltipPopper } from './TooltipPopper'

export interface TooltipProps extends PopperOptions {
  text: string
  style?: ExternalStyles
  offset?: number
  container?: Element
  transitionDelay?: number
  /**
   * Time the mouse rests on the element before the tooltip opens, in milliseconds, so the tooltips the pointer only
   * crosses do not flash. While another tooltip shows, or shortly after one closed, it opens at once, so moving
   * along a toolbar does not wait at each button. The keyboard focus and a tap open it at once.
   * @default 400
   */
  openDelay?: number
  children: React.ReactElement<any>
}

export interface TooltipState {
  visible: boolean
}

// Hidden, waiting for the open delay while the mouse rests on the element, or shown
type TooltipPhase = 'hidden' | 'waiting' | 'shown'

// The time after a tooltip closes during which the next one opens without the delay
const SKIP_DELAY = 300

// Shared by the tooltips of the page: how many show, and whether one has just closed
let shownCount = 0
let closedRecently = false
let closedRecentlyTimer: ReturnType<typeof setTimeout>

const skipsDelay = () => shownCount > 0 || closedRecently

// Counts a tooltip that shows, and returns the function that counts its closing or its unmount
const countShown = () => {
  shownCount++

  return () => {
    shownCount--
    closedRecently = true
    clearTimeout(closedRecentlyTimer)
    closedRecentlyTimer = setTimeout(() => {
      closedRecently = false
    }, SKIP_DELAY)
  }
}

// A focus the browser does not show as coming from the keyboard, such as the one a dialog opened with a click
// gives to its close button, does not open the tooltip: the pointer opens it on hover. Browsers without
// :focus-visible always open it.
const focusedWithoutKeyboard = (element: Element) => {
  try {
    return element.matches(':focus') && !element.matches(':focus-visible')
  } catch (error) {
    return false
  }
}

export function Tooltip(props: TooltipProps) {
  const {
    text,
    offset,
    children,
    style: externalStyle,
    transitionDelay,
    openDelay,
    container,
    modifiers,
    ...rest
  } = props
  const child = React.Children.only(children)
  const { onPointerEnter, onFocus, onBlur } = child.props ?? {}

  const { css, theme, classes } = useStyles(createStyles, props)
  const [phase, setPhase] = useState<TooltipPhase>('hidden')
  const visible = phase === 'shown'

  const rootRef = useRef<HTMLElement>()
  const [popperRef, setPopperRef] = useState<HTMLDivElement>()
  const tooltipId = useMemo(() => `tooltip-${randomStr()}`, [])
  const transitionState = useTransition(visible, { exitTimeout: transitionDelay })

  const {
    styles: { popper: popperStyles },
  } = usePopper(rootRef.current, popperRef, {
    ...rest,
    // The space between the tooltip and its element, as Popper 2 takes it, and then the modifiers of the user
    modifiers: [
      { name: 'offset', options: { offset: [0, theme.typography.sizes.html * offset] } },
      ...(modifiers ?? []),
    ],
  })

  const close = useCallback(() => setPhase('hidden'), [])

  // Closing, an unmount or a text that goes away stop the delay
  useEffect(() => {
    if (phase !== 'waiting') {
      return
    }

    const timer = setTimeout(() => setPhase('shown'), openDelay)
    return () => clearTimeout(timer)
  }, [phase, openDelay])

  useEffect(() => {
    if (!visible) {
      return
    }

    return countShown()
  }, [visible])

  useEffect(() => {
    if (!text) {
      setPhase('hidden')
    }
  }, [text])

  useEffect(() => {
    if (phase === 'hidden') {
      return
    }

    const handleWindowPointerOver = (e: PointerEvent) => {
      // This is implemented using mouseover since mouseleave does not trigger
      // for disabled elements due to browser/react bugs (https://github.com/facebook/react/issues/4251)
      const target = e.target as Node
      if (!rootRef.current?.contains(target)) {
        close()
      }
    }

    // The mouse leaves the page during the delay, so it goes over no other element. A tooltip that shows stays.
    const handleDocumentPointerOut = (e: PointerEvent) => {
      if (phase === 'waiting' && !e.relatedTarget) {
        close()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    window.addEventListener('pointerover', handleWindowPointerOver)
    document.addEventListener('pointerout', handleDocumentPointerOut)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerover', handleWindowPointerOver)
      document.removeEventListener('pointerout', handleDocumentPointerOut)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [phase, close])

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // A tap opens the tooltip at once, and a tap elsewhere closes it
      const tap = e.pointerType === 'touch' || e.pointerType === 'pen'
      const atOnce = tap || !openDelay || skipsDelay()
      setPhase((current) => (atOnce || current === 'shown' ? 'shown' : 'waiting'))
      onPointerEnter?.(e)
    },
    [onPointerEnter, openDelay]
  )

  const handleFocus = useCallback(
    (e) => {
      if (!focusedWithoutKeyboard(e.target)) {
        setPhase('shown')
      }
      onFocus?.(e)
    },
    [onFocus]
  )

  const handleBlur = useCallback(
    (e) => {
      close()
      onBlur?.(e)
    },
    [close, onBlur]
  )

  if (!text) {
    return child
  }

  return (
    <>
      <RootRef rootRef={rootRef}>
        {React.cloneElement(child, {
          // The title of the browser does not show while the tooltip waits for the delay or shows
          title: phase === 'hidden' ? child.props.title || text : child.props.title,
          // The element can have its own descriptions, such as an error message
          'aria-describedby':
            [child.props['aria-describedby'], visible && tooltipId].filter(Boolean).join(' ') || undefined,
          onPointerEnter: handlePointerEnter,
          onFocus: handleFocus,
          onBlur: handleBlur,
        })}
      </RootRef>

      {transitionState !== 'exited' && (
        <Portal container={container}>
          <div
            id={tooltipId}
            ref={setPopperRef}
            className={css(classes.popper, transitionState === 'entered' && classes.visible)}
            style={popperStyles}
            role='tooltip'
            aria-hidden={!visible ? 'true' : 'false'}
          >
            <TooltipPopper text={text} style={externalStyle} />
          </div>
        </Portal>
      )}
    </>
  )
}

Tooltip.defaultProps = {
  placement: 'top',
  offset: 0.25,
  transitionDelay: 200,
  openDelay: 400,
} as Partial<TooltipProps>

const createStyles = (theme: Theme, { transitionDelay }: TooltipProps) => ({
  popper: {
    zIndex: theme.zIndex.tooltip,
    transition: `opacity ${transitionDelay}ms ease`,
    opacity: 0,
  } as CSSProperties,
  visible: {
    opacity: 1,
  } as CSSProperties,
})
