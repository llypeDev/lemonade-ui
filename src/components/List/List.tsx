import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface ListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'style'> {
  /**
   * Draws a line between the items
   * @default true
   */
  divided?: boolean

  /**
   * Draws a box around the list
   * @default false
   */
  bordered?: boolean

  children?: React.ReactNode
  /**
   * Ref of the list element, such as for the `listRef` of a `LoadMore`
   */
  innerRef?: React.Ref<HTMLUListElement>

  style?: ExternalStyles
}

/**
 * A list of `ListItem`s, such as people, files or notifications. Lighter than a `Table`, it fits small screens
 * and items with a picture, a description and actions.
 */
export function List(props: ListProps) {
  const { divided = true, bordered = false, innerRef, style, ...rest } = props
  const { classes, css } = useStyles(createStyles, divided)

  return <ul ref={innerRef} className={css(classes.list, bordered && classes.bordered, style)} {...rest} />
}

const createStyles = (theme: Theme, divided: boolean) => ({
  list: {
    ...theme.typography.variant('main'),
    listStyle: 'none',
    margin: 0,
    padding: 0,
    '& > li:not(:last-child)': divided && {
      borderBottom: `1px solid ${theme.pallete.divider}`,
    },
  } as CSSProperties,
  bordered: {
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.paper,
    overflow: 'hidden',
  } as CSSProperties,
})
