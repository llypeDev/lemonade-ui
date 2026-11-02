import { PositionProperty } from 'csstype'
import React, { CSSProperties } from 'react'

import { useScrollPosition } from '../../hooks/useScrollPosition'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface StickyContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  top?: number
  left?: number
  style?: ExternalStyles
}

export function StickyContainer(props: StickyContainerProps) {
  const { top, left, style, ...rest } = props
  const scroll = useScrollPosition()
  // Without `top`, the container is fixed as soon as the window scrolls
  const position = scroll.scrollY > (top ?? 0) ? 'fixed' : 'absolute'
  const { classes, css } = useStyles(createStyles, props, position)

  return <div className={css(classes.container, style)} {...rest} />
}

export const createStyles = (theme: Theme, { left, top }: StickyContainerProps, position: PositionProperty) => ({
  container: {
    position,
    top: position === 'fixed' ? 0 : top,
    left,
    width: '100%',
    zIndex: 2,
  } as CSSProperties,
})
