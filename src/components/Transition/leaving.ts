import React, { CSSProperties, HTMLAttributes } from 'react'

// React knows `inert` as a boolean from version 19; before, it renders an unknown attribute only from a string
const inert = parseInt(React.version, 10) >= 19 ? true : ''

/**
 * Attributes of an overlay that stays on the page while it animates out, after it closes: it leaves the
 * accessibility tree, and takes no focus and no clicks.
 */
export const leavingAttributes = { 'aria-hidden': true, inert } as HTMLAttributes<HTMLElement>

/**
 * Styles of the same overlay, for browsers without `inert`: clicks go through it, to the page behind
 */
export const leavingStyles = {
  pointerEvents: 'none',
  // Parts of overlays that take clicks, such as the dialog of a modal, set their own pointer-events
  '& *': {
    pointerEvents: 'none !important',
  },
} as CSSProperties
