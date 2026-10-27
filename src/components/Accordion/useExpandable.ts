import { useMemo, useState } from 'react'

import { randomStr } from '../../util/string'

export interface UseExpandableProps {
  /**
   * Controls whether the content is expanded. Use together with `onChange`.
   */
  expanded?: boolean

  /**
   * Whether the content starts expanded when uncontrolled.
   * @default false
   */
  defaultExpanded?: boolean

  /**
   * Called with the new expanded state when the header is clicked.
   */
  onChange?(expanded: boolean): void
}

/**
 * Expanded state (controlled or not) and the ids that link an expandable header to its content.
 */
export function useExpandable(props: UseExpandableProps) {
  const { expanded, defaultExpanded = false, onChange } = props

  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded)
  const isControlled = expanded !== undefined
  const isExpanded = isControlled ? expanded : uncontrolledExpanded

  const id = useMemo(() => randomStr(), [])

  const toggle = () => {
    if (!isControlled) {
      setUncontrolledExpanded(!isExpanded)
    }
    onChange && onChange(!isExpanded)
  }

  return {
    expanded: isExpanded,
    toggle,
    headerId: `expandable-header-${id}`,
    contentId: `expandable-content-${id}`,
  }
}
