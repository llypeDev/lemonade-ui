import React, { CSSProperties, useContext } from 'react'

import { useRovingTabIndex } from '../../hooks/useRovingTabIndex'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export type TabsOrientation = 'horizontal' | 'vertical'

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'style'> {
  /**
   * `vertical` stacks the tabs in a column, beside their content, for many tabs or long labels
   * @default 'horizontal'
   */
  orientation?: TabsOrientation

  style?: ExternalStyles
}

const TabsContext = React.createContext<TabsOrientation>('horizontal')

export const useTabsOrientation = () => useContext(TabsContext)

const isTabItem = (child: React.ReactNode): child is React.ReactElement =>
  React.isValidElement(child) && typeof child.props === 'object'

export function Tabs(props: TabsProps) {
  const { orientation = 'horizontal', style, children, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  // The keyboard enters the list on the active tab, as the ARIA tabs pattern asks
  const enabled = React.Children.toArray(children).filter((child) => isTabItem(child) && !child.props.disabled)
  const activeIndex = enabled.findIndex((child) => isTabItem(child) && child.props.active)

  const rootRef = useRovingTabIndex({
    initialIndex: Math.max(0, activeIndex),
    getItems: (root) => Array.from(root.querySelectorAll(`[role="tab"]:not(.disabled)`)),
  })

  return (
    <TabsContext.Provider value={orientation}>
      <ul
        ref={rootRef}
        className={css(classes.ul, orientation === 'vertical' && classes.vertical, style)}
        role='tablist'
        aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
        {...rest}
      >
        {children}
      </ul>
    </TabsContext.Provider>
  )
}

const createStyles = (theme: Theme) => ({
  ul: {
    display: 'flex',
    alignItems: 'flex-end',
    listStyle: 'none',
    padding: '0',
    margin: '0',
    fontSize: theme.typography.sizes.button,
    borderBottom: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
  vertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    borderBottom: 'none',
    borderRight: `1px solid ${theme.pallete.divider}`,
  } as CSSProperties,
})
