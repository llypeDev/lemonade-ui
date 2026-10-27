import { css } from 'emotion'
import React from 'react'

import { ExternalStyles, Theme, useTheme } from '../../styles'
import { Omit } from '../../util'
import { ExpandableHeader, ExpandableHeadingLevel } from '../Accordion/ExpandableHeader'
import { useExpandable, UseExpandableProps } from '../Accordion/useExpandable'

import { CardVariant, createBaseStyles, createVariantStyles } from './cardVariants'

export interface ExpandableCardProps
  extends UseExpandableProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onChange' | 'style'> {
  style?: ExternalStyles

  /**
   * Content of the header button that expands or collapses the card. It is the card's only click area,
   * so the content can hold its own buttons and links.
   */
  title: React.ReactNode

  /**
   * Level of the heading that wraps the header button, so the card fits the page outline.
   * @default 3
   */
  headingLevel?: ExpandableHeadingLevel

  /**
   * Defines the visual style of the Card
   * @default 'outline'
   */
  variant?: CardVariant

  /**
   * Specify whether the Card should have error appearance
   */
  invalid?: boolean

  /**
   * Specify whether the Card can't be expanded or collapsed
   */
  disabled?: boolean
}

/**
 * A card that shows or hides its content, with the same behavior as `AccordionItem`.
 */
export function ExpandableCard(props: ExpandableCardProps) {
  const {
    title,
    expanded: expandedProp,
    defaultExpanded,
    onChange,
    headingLevel = 3,
    variant = 'outline',
    invalid,
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

  const theme = useTheme()
  const styles = createStyles(theme, variant, disabled, invalid, style)

  return (
    <div className={styles.card} {...rest}>
      <ExpandableHeader
        id={headerId}
        contentId={contentId}
        expanded={expanded}
        disabled={disabled}
        headingLevel={headingLevel}
        onClick={toggle}
        style={styles.header}
      >
        {title}
      </ExpandableHeader>
      <div id={contentId} role='region' aria-labelledby={headerId} hidden={!expanded} className={styles.content}>
        {children}
      </div>
    </div>
  )
}

const createStyles = (
  theme: Theme,
  variant: CardVariant,
  disabled: boolean,
  invalid: boolean,
  externalStyles: ExternalStyles
) => {
  const baseStyles = createBaseStyles(theme)
  const variantStyles = createVariantStyles(theme)[variant]

  return {
    card: css(
      baseStyles.card,
      variantStyles.base,
      { padding: 0 },
      invalid && variantStyles.invalid,
      disabled && variantStyles.disabled,
      externalStyles
    ),
    header: css({ padding: '1rem' }),
    content: css({ padding: '0 1rem 1rem' }, disabled && baseStyles.innerDisabled),
  }
}
