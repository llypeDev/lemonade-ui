import React, { CSSProperties, RefObject } from 'react'
import Transition, { TransitionProps, TransitionStatus } from 'react-transition-group/Transition'

import { ClassNames, Theme, useStyles } from '../../styles'

import { animates } from './animates'

export type FadeTransitionProps = Partial<TransitionProps<HTMLElement | undefined>> & {
  children?(renderProps: FadeTransitionRenderProps): React.ReactNode
}

export interface FadeTransitionRenderProps {
  state: TransitionStatus
  classes: ClassNames<'default' | 'entering' | 'entered'>
  className?: string
}

/**
 * Fades its content in and out over `timeout`. Content rendered in a portal must give its element in `nodeRef`,
 * since the transition cannot find it there. Without motion, the content shows and goes away at once.
 */
export function FadeTransition(props: FadeTransitionProps) {
  const { children, timeout, nodeRef, onEnter, ...rest } = props
  const { classes, css } = useStyles(createStyles, timeout)
  const motion = animates()

  const handleEnter = (...args: any[]) => {
    // The transparent content is laid out before its opacity changes, so the browser fades it from there
    const node: HTMLElement = nodeRef ? (nodeRef as RefObject<HTMLElement>).current : args[0]
    node && node.getBoundingClientRect()
    onEnter && (onEnter as (...params: any[]) => void)(...args)
  }

  return (
    <Transition enter={motion} exit={motion} {...rest} nodeRef={nodeRef} timeout={timeout} onEnter={handleEnter}>
      {(state) =>
        children({
          state,
          classes,
          className: css(classes.default, classes[state]),
        })
      }
    </Transition>
  )
}

FadeTransition.defaultProps = {
  timeout: 200,
}

const createStyles = (_theme: Theme, timeout: FadeTransitionProps['timeout']) => ({
  default: {
    transition: `opacity ${timeout}ms ease-in-out`,
    opacity: 0,
    // The transparent state can be laid out before the content shows, such as by a focus trap looking for what it
    // can focus, and the fade would run from it
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  entering: { opacity: 1 } as CSSProperties,
  entered: { opacity: 1 } as CSSProperties,
})
