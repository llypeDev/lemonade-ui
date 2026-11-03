import React, { CSSProperties, useEffect, useMemo, useState } from 'react'

import { useCollapse } from '../../hooks/useCollapse'
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
 * The button only shows up when the text does not fit. The text slides between its lines and its whole height.
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
  const contentId = useMemo(() => `expandable-text-${randomStr()}`, [])
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded

  // The whole text stays while it slides back to its lines, and is clamped at the end
  const collapse = useCollapse(isExpanded, {
    // The height of the lines, measured with the clamp on for a moment
    collapsedHeight: (element) => {
      element.classList.add(classes.clamped)
      const { height } = element.getBoundingClientRect()
      element.classList.remove(classes.clamped)
      return height
    },
  })
  const clamped = collapse.hidden
  const overflowing = useIsOverflowing(collapse.ref, 'vertical')

  // Expanded, the text does not overflow, so right after a collapse `overflowing` is still false: the button
  // stays until the clamped text is measured, so it keeps the focus instead of leaving the page for a moment
  const [previous, setPrevious] = useState(isExpanded)
  const [measuring, setMeasuring] = useState(false)
  if (previous !== isExpanded) {
    setPrevious(isExpanded)
    setMeasuring(!isExpanded)
  }
  // Runs after the measure of useIsOverflowing, which comes first
  useEffect(() => {
    measuring && clamped && setMeasuring(false)
  }, [measuring, clamped])

  const toggle = () => {
    if (expanded === undefined) {
      setInternalExpanded(!isExpanded)
    }
    onExpandedChange && onExpandedChange(!isExpanded)
  }

  return (
    <div className={css(classes.root, style)} {...rest}>
      <div id={contentId} ref={collapse.ref} className={css(classes.content, clamped && classes.clamped)}>
        {children}
      </div>
      {(isExpanded || overflowing || measuring) && (
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
