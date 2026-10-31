import { ResizeObserver } from '@juggle/resize-observer'
import React, { CSSProperties, useEffect, useState } from 'react'

import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { Tooltip } from '../Tooltip'

export interface TruncatedTextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  /**
   * Number of lines shown before the text is cut
   * @default 1
   */
  lines?: number

  /**
   * Text of the tooltip that shows the whole text
   * @default the text of the children
   */
  tooltip?: string

  /**
   * Element that renders the text
   * @default 'span'
   */
  component?: React.ElementType

  children?: React.ReactNode
  style?: ExternalStyles
}

/**
 * Text cut with an ellipsis when it does not fit in its width or in a number of lines, such as a long file name
 * in a table. Only when the text is cut, it shows whole in a tooltip and the keyboard can reach it.
 * To let the user expand a long text in place, use `ExpandableText`.
 */
export function TruncatedText(props: TruncatedTextProps) {
  const { lines = 1, tooltip, component: Component = 'span', children, style, ...rest } = props
  const { classes, css } = useStyles(createStyles, lines)
  const [element, setElement] = useState<HTMLElement>(null)
  const [truncated, setTruncated] = useState(false)

  // Checks again whenever the size or the text changes
  useEffect(() => {
    if (!element) {
      return
    }

    const check = () =>
      setTruncated(
        lines === 1 ? element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight
      )
    const observer = new ResizeObserver(check)
    observer.observe(element)
    check()
    return () => observer.disconnect()
  }, [element, lines, children])

  const text = tooltip ?? (typeof children === 'string' ? children : element ? element.textContent : '')

  const content = (
    <Component
      ref={setElement}
      className={css(classes.text, truncated && classes.truncated, style)}
      // Only a cut text takes the focus, so keyboard users can open its tooltip
      tabIndex={truncated ? 0 : undefined}
      {...rest}
    >
      {children}
    </Component>
  )

  return truncated && text ? <Tooltip text={text}>{content}</Tooltip> : content
}

const createStyles = (theme: Theme, lines: number) => ({
  text:
    lines === 1
      ? ({
          display: 'inline-block',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          // Keeps the box on the line of the text around it
          verticalAlign: 'bottom',
        } as CSSProperties)
      : ({
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          overflowWrap: 'anywhere',
        } as CSSProperties),
  truncated: {
    outline: 'none',
    borderRadius: theme.radius.input,
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
})
