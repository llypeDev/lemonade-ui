import React, { CSSProperties, useContext, useEffect, useState } from 'react'

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

const getTabs = (root: HTMLElement): HTMLElement[] => Array.from(root.querySelectorAll(`[role="tab"]:not(.disabled)`))

export function Tabs(props: TabsProps) {
  const { orientation = 'horizontal', style, children, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  // The keyboard enters the list on the active tab, as the ARIA tabs pattern asks. It is found among the rendered
  // tabs, the same list the roving tabindex counts, since a tab can be inside another component.
  const [activeIndex, setActiveIndex] = useState(0)

  const rootRef = useRovingTabIndex({
    initialIndex: activeIndex,
    // A new function on each render, so the tabindex of tabs added later is set too
    getItems: (root) => getTabs(root),
  })

  useEffect(() => {
    const index = getTabs(rootRef.current).findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
    setActiveIndex(Math.max(0, index))
  }, [children, rootRef])

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
