import React, { CSSProperties } from 'react'

import { ExternalStyles, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface VisuallyHiddenProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * Element rendered. Use a `div` to hide block content, such as a heading of a section that is already clear
   * from its layout.
   * @default 'span'
   */
  component?: React.ElementType

  style?: ExternalStyles
}

/**
 * Styles that take content off the screen but keep it for screen readers. Use them in a style of your own
 * when the `VisuallyHidden` element does not fit, such as on a `label`.
 */
export const visuallyHiddenStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/**
 * Content read by screen readers but not shown on the screen, such as the name of an icon-only control or the
 * context a sighted user gets from the layout. Unlike `display: none`, the content stays in the accessibility tree.
 */
export function VisuallyHidden(props: VisuallyHiddenProps) {
  const { component: Component = 'span', style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  return <Component className={css(classes.root, style)} {...rest} />
}

const createStyles = () => ({
  root: visuallyHiddenStyle,
})
