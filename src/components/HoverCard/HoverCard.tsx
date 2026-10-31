import { Placement } from '@popperjs/core'
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { usePopper } from 'react-popper'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { randomStr } from '../../util/string'
import { Portal } from '../Portal'
import { RootRef } from '../RootRef'

export interface HoverCardProps {
  /**
   * The element that shows the card, usually a link, such as the name of a person
   */
  children: React.ReactElement

  /**
   * The preview, such as a summary of the person or of the page the link goes to
   */
  content: React.ReactNode

  /**
   * Time the pointer or the focus stays on the element before the card shows, in milliseconds
   * @default 500
   */
  openDelay?: number

  /**
   * Time before the card hides after the pointer leaves, in milliseconds. The pointer can move into the card meanwhile.
   * @default 300
   */
  closeDelay?: number

  /**
   * @default 'bottom-start'
   */
  placement?: Placement

  style?: ExternalStyles
}

/**
 * A card with a preview that shows when the pointer rests on an element or the keyboard focuses it, such as a
 * person's profile on their name. The card only adds information: everything in it must also be reachable by
 * following the element, since keyboard and touch users may never see it.
 */
export function HoverCard(props: HoverCardProps) {
  const { children, content, openDelay = 500, closeDelay = 300, placement = 'bottom-start', style } = props
  const child = React.Children.only(children)

  const { classes, css } = useStyles(createStyles)
  const triggerRef = useRef<HTMLElement>(null)
  const [cardRef, setCardRef] = useState<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const timer = useRef<any>(null)
  const cardId = useMemo(() => `hover-card-${randomStr()}`, [])

  const {
    styles: { popper: popperStyle },
    attributes: { popper: popperAttributes },
  } = usePopper(triggerRef.current, cardRef, {
    placement,
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
  })

  const schedule = (next: boolean, delay: number) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(next), delay)
  }

  const show = () => schedule(true, openDelay)
  const hide = () => schedule(false, closeDelay)

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (!open) {
      return
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimeout(timer.current)
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handler = (name: string, action: () => void) => (e: React.SyntheticEvent) => {
    child.props[name] && child.props[name](e)
    action()
  }

  return (
    <>
      <RootRef rootRef={triggerRef}>
        {React.cloneElement(child, {
          'aria-describedby': open ? cardId : child.props['aria-describedby'],
          onMouseEnter: handler('onMouseEnter', show),
          onMouseLeave: handler('onMouseLeave', hide),
          onFocus: handler('onFocus', show),
          onBlur: handler('onBlur', hide),
        })}
      </RootRef>
      {open && (
        <Portal>
          <div
            id={cardId}
            ref={setCardRef}
            className={css(classes.card, style)}
            style={popperStyle}
            onMouseEnter={() => clearTimeout(timer.current)}
            onMouseLeave={hide}
            {...popperAttributes}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  )
}

const createStyles = (theme: Theme) => ({
  card: {
    ...theme.typography.variant('main'),
    zIndex: theme.zIndex.popper,
    boxSizing: 'border-box',
    width: '20rem',
    maxWidth: 'calc(100vw - 2rem)',
    padding: '1rem',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.popper,
    background: theme.pallete.surface.main,
    boxShadow: theme.shadows.outer[40],
  } as CSSProperties,
})
