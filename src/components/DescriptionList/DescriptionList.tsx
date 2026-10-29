import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export type DescriptionListLayout = 'horizontal' | 'vertical'

export interface DescriptionListItem {
  /**
   * Name of the information, such as "Email"
   */
  term: React.ReactNode

  /**
   * The information itself
   */
  description: React.ReactNode

  /**
   * Key of the item, when the terms are not unique strings
   */
  key?: React.Key
}

export interface DescriptionListProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'style'> {
  items: DescriptionListItem[]

  /**
   * `horizontal` puts each term on the left of its description; `vertical` puts it above.
   * On small screens, a horizontal list turns vertical.
   * @default 'horizontal'
   */
  layout?: DescriptionListLayout

  /**
   * Number of columns of a vertical list. On small screens, the list has a single column.
   * @default 1
   */
  columns?: number

  /**
   * Width of the term column of a horizontal list, as a CSS value or pixels
   * @default '12rem'
   */
  termWidth?: number | string

  /**
   * Draws a line between the items
   * @default false
   */
  divided?: boolean

  style?: ExternalStyles
}

/**
 * Pairs of terms and descriptions, such as the details of a record, a summary before a confirmation or the
 * properties of an item.
 */
export function DescriptionList(props: DescriptionListProps) {
  const { items, layout = 'horizontal', columns = 1, termWidth = '12rem', divided = false, style, ...rest } = props
  const { classes, css } = useStyles(createStyles, layout, columns, termWidth, divided)

  return (
    <dl className={css(classes.list, style)} {...rest}>
      {items.map((item, index) => (
        <div key={item.key ?? (typeof item.term === 'string' ? item.term : index)} className={classes.item}>
          <dt className={classes.term}>{item.term}</dt>
          <dd className={classes.description}>{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

const createStyles = (
  theme: Theme,
  layout: DescriptionListLayout,
  columns: number,
  termWidth: number | string,
  divided: boolean
) => {
  const horizontal = layout === 'horizontal'
  const itemSpacing = divided ? '0.75rem' : '0.5rem'

  return {
    list: {
      ...theme.typography.variant('main'),
      display: 'grid',
      gridTemplateColumns: horizontal ? '1fr' : `repeat(${columns}, minmax(0, 1fr))`,
      columnGap: '2rem',
      // A stacked item needs more space around it than between its term and description
      rowGap: divided ? 0 : horizontal ? '0.5rem' : '1rem',
      margin: 0,
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        rowGap: divided ? 0 : '1rem',
      },
    } as CSSProperties,
    item: {
      display: 'grid',
      gridTemplateColumns: horizontal ? `${typeof termWidth === 'number' ? `${termWidth}px` : termWidth} 1fr` : '1fr',
      columnGap: '1rem',
      rowGap: '0.125rem',
      alignItems: 'baseline',
      minWidth: 0,
      ...(divided && {
        padding: `${itemSpacing} 0`,
        borderBottom: `1px solid ${theme.pallete.divider}`,
      }),
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
      },
    } as CSSProperties,
    term: {
      fontWeight: 'bold',
      color: theme.pallete.text.main,
    } as CSSProperties,
    description: {
      margin: 0,
      minWidth: 0,
      overflowWrap: 'anywhere',
      color: theme.pallete.text.main,
    } as CSSProperties,
  }
}
