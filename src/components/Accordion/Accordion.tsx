import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: ExternalStyles
}

/**
 * Groups `AccordionItem`s. Besides Tab, the item headers can be navigated with the arrow keys, Home and End.
 */
export function Accordion(props: AccordionProps) {
  const { style, onKeyDown, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown && onKeyDown(event)

    const headers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-expandable-header]:not(:disabled)')
    )
    const current = headers.indexOf(event.target as HTMLButtonElement)

    if (current === -1) {
      return
    }

    const next = {
      ArrowDown: (current + 1) % headers.length,
      ArrowUp: (current - 1 + headers.length) % headers.length,
      Home: 0,
      End: headers.length - 1,
    }[event.key]

    if (next !== undefined) {
      event.preventDefault()
      headers[next].focus()
    }
  }

  return <div className={css(classes.accordion, style)} onKeyDown={handleKeyDown} {...rest} />
}

const createStyles = (theme: Theme) => ({
  accordion: {
    borderTop: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
})
