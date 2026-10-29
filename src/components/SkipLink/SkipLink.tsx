import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { visuallyHiddenStyle } from '../VisuallyHidden'

export interface SkipLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'style' | 'href'> {
  /**
   * Id of the element the link skips to, usually the `main` element of the page
   * @default 'main'
   */
  target?: string

  /**
   * Text of the link
   * @default "Skip to main content", from the locale strings
   */
  children?: React.ReactNode

  style?: ExternalStyles
}

/**
 * Link that lets keyboard users jump over the header and the navigation, straight to the content of the page.
 * It is hidden until it gets focus, so place it as the first focusable element of the page.
 */
export function SkipLink(props: SkipLinkProps) {
  const { target = 'main', children, onClick, style, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick && onClick(e)

    const element = !e.defaultPrevented && document.getElementById(target)
    if (!element) {
      return
    }

    // Moving the focus ourselves, instead of following the hash, works the same in every browser and
    // does not disturb routers that use the hash
    e.preventDefault()
    // Elements such as `main` only take the focus with a tabindex
    if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1')
    }
    element.focus()
    element.scrollIntoView && element.scrollIntoView()
  }

  return (
    <a href={`#${target}`} className={css(classes.link, style)} onClick={handleClick} {...rest}>
      {children ?? locale.skipLink.label}
    </a>
  )
}

const createStyles = (theme: Theme) => ({
  link: {
    ...visuallyHiddenStyle,
    fontFamily: theme.typography.fontFamily,
    '&:focus': {
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      zIndex: theme.zIndex.tooltip,
      width: 'auto',
      height: 'auto',
      margin: 0,
      padding: '0.75rem 1rem',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
      fontSize: theme.typography.sizes.text,
      fontWeight: 'bold',
      lineHeight: 1.5,
      textDecoration: 'none',
      color: theme.pallete.surface.main,
      background: theme.pallete.primary.main,
      borderRadius: theme.radius.button,
      boxShadow: `${theme.shadows.outer[40]}, ${focusBoxShadow(theme)}`,
      outline: 'none',
    },
  } as CSSProperties,
})
