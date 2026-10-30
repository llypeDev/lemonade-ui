import React, { CSSProperties, useMemo, useRef, useState } from 'react'

import { useIsOverflowing } from '../../hooks/useIsOverflowing'
import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'

export interface ExpandableTextProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * Number of lines shown while collapsed
   * @default 3
   */
  lines?: number

  /**
   * Whether the text is expanded, for a controlled component
   */
  expanded?: boolean

  /**
   * Whether an uncontrolled text starts expanded
   * @default false
   */
  defaultExpanded?: boolean

  /**
   * Called when the user expands or collapses the text
   */
  onExpandedChange?(expanded: boolean): void

  /**
   * @default "Show more", from the locale strings
   */
  moreLabel?: React.ReactNode

  /**
   * @default "Show less", from the locale strings
   */
  lessLabel?: React.ReactNode

  children?: React.ReactNode
  style?: ExternalStyles
}

/**
 * Long text cut after a few lines, with a button that shows the rest, such as a description or a comment.
 * The button only shows up when the text does not fit.
 */
export function ExpandableText(props: ExpandableTextProps) {
  const {
    lines = 3,
    expanded,
    defaultExpanded = false,
    onExpandedChange,
    moreLabel,
    lessLabel,
    children,
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, lines)
  const contentRef = useRef<HTMLDivElement>(null)
  const contentId = useMemo(() => `expandable-text-${randomStr()}`, [])
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded
  const overflowing = useIsOverflowing(contentRef, 'vertical')

  const toggle = () => {
    if (expanded === undefined) {
      setInternalExpanded(!isExpanded)
    }
    onExpandedChange && onExpandedChange(!isExpanded)
  }

  return (
    <div className={css(classes.root, style)} {...rest}>
      <div id={contentId} ref={contentRef} className={css(classes.content, !isExpanded && classes.clamped)}>
        {children}
      </div>
      {(isExpanded || overflowing) && (
        <button
          type='button'
          className={classes.toggle}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={toggle}
        >
          {isExpanded ? lessLabel ?? locale.expandableText.less : moreLabel ?? locale.expandableText.more}
        </button>
      )}
    </div>
  )
}

const createStyles = (theme: Theme, lines: number) => ({
  root: {
    ...theme.typography.variant('main'),
    minWidth: 0,
  } as CSSProperties,
  content: {
    overflowWrap: 'anywhere',
  } as CSSProperties,
  clamped: {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  } as CSSProperties,
  toggle: {
    ...theme.typography.variant('link'),
    display: 'inline-block',
    marginTop: '0.25rem',
    padding: 0,
    border: 0,
    background: 'none',
    cursor: 'pointer',
    outline: 'none',
    borderRadius: 2,
    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
})
