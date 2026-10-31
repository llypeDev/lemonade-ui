import React, { CSSProperties, useEffect, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Icon } from '../Icon'

export interface BackToTopProps {
  /**
   * How far the page must scroll, in pixels, for the button to show
   * @default 400
   */
  threshold?: number

  /**
   * Element that scrolls, when it is not the page
   */
  scrollContainer?: HTMLElement | null

  /**
   * CSS selector of the element that gets the focus at the top, such as the main heading
   * @default 'h1'
   */
  focusTarget?: string

  /**
   * @default "Back to top", from the locale strings
   */
  label?: string

  style?: ExternalStyles
}

const reducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A floating button at the corner of the screen that takes the user back to the top of a long page. It shows
 * only after the page scrolls down.
 */
export function BackToTop(props: BackToTopProps) {
  const { threshold = 400, scrollContainer, focusTarget = 'h1', label, style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [visible, setVisible] = useState(false)
  const name = label ?? locale.backToTop.label

  useEffect(() => {
    const target: HTMLElement | Window = scrollContainer ?? window
    const update = () => setVisible((scrollContainer ? scrollContainer.scrollTop : window.pageYOffset) > threshold)

    update()
    target.addEventListener('scroll', update, { passive: true } as any)
    return () => target.removeEventListener('scroll', update)
  }, [scrollContainer, threshold])

  const handleClick = () => {
    const behavior = reducedMotion() ? 'auto' : 'smooth'
    if (scrollContainer) {
      scrollContainer.scrollTo && scrollContainer.scrollTo({ top: 0, behavior })
    } else {
      window.scrollTo({ top: 0, behavior })
    }

    // The button goes away at the top, so the focus moves to the start of the content, skipping hidden elements
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(focusTarget))
    const element = candidates.find((candidate) => candidate.getClientRects().length > 0) ?? candidates[0]
    if (element) {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1')
      }
      element.focus({ preventScroll: true })
    }
  }

  if (!visible) {
    return null
  }

  return (
    <button type='button' className={css(classes.button, style)} aria-label={name} title={name} onClick={handleClick}>
      <Icon icon='arrowUp' size={1.5} />
    </button>
  )
}

const createStyles = (theme: Theme) => ({
  button: {
    position: 'fixed',
    right: '1.5rem',
    bottom: '1.5rem',
    zIndex: theme.zIndex.popper,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
    height: '3rem',
    margin: 0,
    padding: 0,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: '50%',
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    boxShadow: theme.shadows.outer[40],
    cursor: 'pointer',
    outline: 'none',
    transition: 'background .2s, color .2s',
    '&:hover': {
      background: theme.pallete.primary.main,
      color: theme.pallete.surface.main,
    },
    '&:focus': {
      boxShadow: `${theme.shadows.outer[40]}, ${focusBoxShadow(theme)}`,
    },
    [theme.breakpoints.down('sm')]: {
      right: '1rem',
      bottom: '1rem',
    },
  } as CSSProperties,
})
