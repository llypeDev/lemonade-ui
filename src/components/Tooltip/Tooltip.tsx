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
  children: React.ReactElement<any>
}

export interface TooltipState {
  visible: boolean
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
  const { text, offset, children, style: externalStyle, transitionDelay, container, ...rest } = props
  const child = React.Children.only(children)
  const { onPointerEnter, onFocus, onBlur } = child.props ?? {}

  const { css, theme, classes } = useStyles(createStyles, props)
  const [visible, setVisible] = useState<boolean>(false)

  const rootRef = useRef<HTMLElement>()
  const [popperRef, setPopperRef] = useState<HTMLDivElement>()
  const tooltipId = useMemo(() => `tooltip-${randomStr()}`, [])
  const transitionState = useTransition(visible, { exitTimeout: transitionDelay })

  const {
    styles: { popper: popperStyles },
  } = usePopper(rootRef.current, popperRef, {
    // The space between the tooltip and its element, as Popper 2 takes it
    modifiers: [{ name: 'offset', options: { offset: [0, theme.typography.sizes.html * offset] } }],
    ...rest,
  })

  useEffect(() => {
    if (!rootRef || !visible) {
      return
    }

    const handleWindowPointerOver = (e: PointerEvent) => {
      // This is implemented using mouseover since mouseleave does not trigger
      // for disabled elements due to browser/react bugs (https://github.com/facebook/react/issues/4251)
      const target = e.target as Node
      if (!rootRef.current?.contains(target)) {
        setVisible(false)
      }
    }

    window.addEventListener('pointerover', handleWindowPointerOver)
    return () => window.removeEventListener('pointerover', handleWindowPointerOver)
  }, [rootRef, visible])

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      setVisible(true)
      onPointerEnter?.(e)
    },
    [onPointerEnter]
  )

  const handleFocus = useCallback(
    (e) => {
      if (!focusedWithoutKeyboard(e.target)) {
        setVisible(true)
      }
      onFocus?.(e)
    },
    [onFocus]
  )

  const handleBlur = useCallback(
    (e) => {
      setVisible(false)
      onBlur?.(e)
    },
    [onBlur]
  )

  if (!text) {
    return child
  }

  return (
    <>
      <RootRef rootRef={rootRef}>
        {React.cloneElement(child, {
          title: !visible ? child.props.title || text : child.props.title,
          'aria-describedby': visible ? tooltipId : undefined,
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
