import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

import { ExpandableHeader, ExpandableHeadingLevel } from './ExpandableHeader'
import { useExpandable, UseExpandableProps } from './useExpandable'

export interface AccordionItemProps
  extends UseExpandableProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onChange' | 'style'> {
  /**
   * Content of the header button that expands or collapses the item.
   */
  title: React.ReactNode

  /**
   * Level of the heading that wraps the header button, so the item fits the page outline.
   * @default 3
   */
  headingLevel?: ExpandableHeadingLevel

  /**
   * Whether the item can't be expanded or collapsed.
   */
  disabled?: boolean

  style?: ExternalStyles
}

export function AccordionItem(props: AccordionItemProps) {
  const {
    title,
    expanded: expandedProp,
    defaultExpanded,
    onChange,
    headingLevel = 3,
    disabled,
    style,
    children,
    ...rest
  } = props

  const { expanded, toggle, headerId, contentId } = useExpandable({
    expanded: expandedProp,
    defaultExpanded,
    onChange,
  })
  const { classes, css } = useStyles(createStyles)

  return (
    <div className={css(classes.item, style)} {...rest}>
      <ExpandableHeader
        id={headerId}
        contentId={contentId}
        expanded={expanded}
        disabled={disabled}
        headingLevel={headingLevel}
        onClick={toggle}
      >
        {title}
      </ExpandableHeader>
      <div id={contentId} role='region' aria-labelledby={headerId} hidden={!expanded} className={classes.content}>
        {children}
      </div>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  item: {
    borderBottom: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  content: {
    // Aligned with the header title: 1rem padding + 1.5rem icon + 0.5rem gap
    padding: '0 1rem 1rem 3rem',
    color: theme.pallete.text.main,
  } as CSSProperties,
})
