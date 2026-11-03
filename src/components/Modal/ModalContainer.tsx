import React, { CSSProperties, forwardRef } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { useModalContext } from '../../hooks'

import { ModalScroll } from './Modal'

export interface ModalContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: ExternalStyles
}

/**
 * Nests styles given to the modal in a rule of their own, which comes after the rules for small screens of the
 * modal, so they win over those too, as they do on wider screens.
 */
export const overriding = (style: ExternalStyles): ExternalStyles => (style ? { '&': style } : undefined)

export const ModalContainer = forwardRef<HTMLDivElement, ModalContainerProps>((props, ref) => {
  const { style, children, ...rest } = props

  const { scroll, hasHeader, titleId, hasTitle } = useModalContext()
  const { classes, css } = useStyles(createStyles, scroll, hasHeader)

  // Named by the title of its header, unless it is given another name
  const labelledBy = hasTitle && !rest['aria-label'] ? titleId : undefined

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby={labelledBy}
      ref={ref}
      className={css(classes.wrapper, overriding(style))}
      {...rest}
    >
      <div className={classes.inner}>{children}</div>
    </div>
  )
})

const createStyles = (theme: Theme, scroll: ModalScroll, hasHeader: boolean) => {
  const gridTemplateRowsScrollBody = hasHeader ? 'auto 1fr auto' : '1fr auto'
  return {
    wrapper: {
      maxHeight: '80vh',
      border: `1px solid ${theme.pallete.divider}`,
      boxShadow: theme.shadows.outer['160'],
      borderRadius: theme.radius.modal,
      backgroundColor: theme.pallete.surface.main,
      minWidth: 'min(520px, 100%)',
      pointerEvents: 'auto',
      overflow: scroll === 'body' ? 'hidden' : 'auto',
      display: 'grid',
      gridTemplateRows: '1fr',
      [theme.breakpoints.down('sm')]: {
        // As tall as the screen allows, but for the space around it
        maxHeight: '100%',
      },
    } as CSSProperties,
    inner: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gridTemplateRows: scroll === 'body' ? gridTemplateRowsScrollBody : 'max-content',
      height: '100%',
      minHeight: 0,
      [theme.breakpoints.down('sm')]: {
        // One section under the other, at full width, in the order each section gives itself
        display: 'flex',
        flexDirection: 'column',
      },
    } as CSSProperties,
  }
}
