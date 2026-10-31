import React, { CSSProperties } from 'react'

import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export interface TabPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * Shows the panel. A hidden panel stays out of the page and of the accessibility tree.
   * @default true
   */
  active?: boolean

  style?: ExternalStyles
}

/**
 * Content of a tab. Give it an `id` that its `TabItem` points to with `aria-controls`, and point back to the
 * tab with `aria-labelledby`.
 */
export function TabPanel(props: TabPanelProps) {
  const { active = true, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  // The panel takes the focus with Tab, so keyboard users reach content without focusable elements
  return <div role='tabpanel' tabIndex={0} hidden={!active} className={css(classes.panel, style)} {...rest} />
}

const createStyles = (theme: Theme) => ({
  panel: {
    outline: 'none',
    '&:focus-visible': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
})
