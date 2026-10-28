import { Options as PopperOptions, Placement } from '@popperjs/core'
import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { usePopper } from 'react-popper'

import { useClickOutside } from '../../hooks/useClickOutside'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'

export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * The element that opens the popover. It receives `aria-haspopup`, `aria-expanded` and `aria-controls`.
   */
  anchorRef: HTMLElement | null

  open: boolean

  /**
   * Called whenever the popover wants to close itself:
   * - `Escape` is pressed, which also moves the focus back to the anchor when it was inside the popover
   * - The focus leaves the popover and the anchor
   * - A click happens outside the popover and the anchor
   */
  onClose?(): void

  /**
   * @default 'bottom-start'
   */
  placement?: Placement

  /**
   * Distance from the anchor, in rem
   * @default 0.25
   */
  offset?: number

  /**
   * Moves the focus to the first focusable element inside the popover, or to the popover itself, when it opens
   * @default true
   */
  autoFocus?: boolean

  /**
   * Popper instance props
   */
  popperProps?: Partial<PopperOptions>

  style?: ExternalStyles
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Floating panel attached to an element, for interactive content such as filters, short forms or details.
 * For plain text use `Tooltip`, and for a list of actions use `Dropdown`.
 */
export function Popover(props: PopoverProps) {
  const {
    anchorRef,
    open,
    onClose,
    placement = 'bottom-start',
    offset = 0.25,
    autoFocus = true,
    popperProps,
    style,
    children,
    ...rest
  } = props

  const { classes, css, theme } = useStyles(createStyles)
  const [popoverRef, setPopoverRef] = useState<HTMLDivElement>()
  const popoverId = useMemo(() => `popover-${randomStr()}`, [])

  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(anchorRef, popoverRef, {
    placement,
    ...popperProps,
    modifiers: [
      { name: 'offset', options: { offset: [0, theme.typography.sizes.html * offset] } },
      ...(popperProps?.modifiers ?? []),
    ],
  })

  const close = useCallback(() => onClose?.(), [onClose])

  // Attaches aria attributes to the anchor element
  useEffect(() => {
    if (!anchorRef) {
      return
    }

    anchorRef.setAttribute('aria-haspopup', 'dialog')
    anchorRef.setAttribute('aria-expanded', open ? 'true' : 'false')

    if (open) {
      anchorRef.setAttribute('aria-controls', popoverId)
    } else {
      anchorRef.removeAttribute('aria-controls')
    }
  }, [anchorRef, open, popoverId])

  // Closes with Escape and, when the focus was inside, gives it back to the anchor
  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const hadFocus = popoverRef?.contains(document.activeElement)
        close()
        hadFocus && anchorRef?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, close, anchorRef, popoverRef])

  // Moves the focus inside when opened
  useEffect(() => {
    if (open && autoFocus && popoverRef) {
      const firstFocusable = popoverRef.querySelector<HTMLElement>(focusableSelector)
      ;(firstFocusable ?? popoverRef).focus({ preventScroll: true })
    }
  }, [open, autoFocus, popoverRef])

  useClickOutside([anchorRef, popoverRef], () => {
    if (open) {
      close()
    }
  })

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node

    if (next && !popoverRef?.contains(next) && !anchorRef?.contains(next)) {
      close()
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      id={popoverId}
      ref={setPopoverRef}
      role='dialog'
      tabIndex={-1}
      className={css(classes.popover, style)}
      style={popperStyle}
      onBlur={handleBlur}
      {...popperAttributes}
      {...rest}
    >
      {children}
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  popover: {
    ...theme.typography.variant('main'),
    zIndex: theme.zIndex.popper,
    boxSizing: 'border-box',
    maxWidth: 'calc(100vw - 2rem)',
    padding: '1rem',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.popper,
    background: theme.pallete.surface.main,
    boxShadow: theme.shadows.outer[40],
    outline: 'none',
  } as CSSProperties,
})
