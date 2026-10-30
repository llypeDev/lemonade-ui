import React, { CSSProperties, useMemo, useRef, useState } from 'react'

import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { Icon, IconImage } from '../Icon'

export interface TreeNode {
  /**
   * Unique id of the node in the tree
   */
  id: string

  label: React.ReactNode

  /**
   * Text of the label, for the search by typing, when the label is not a string
   */
  textValue?: string

  icon?: IconImage

  /**
   * Nodes inside this one. A node with children expands and collapses.
   */
  children?: TreeNode[]

  /**
   * The node can still get the focus, to be read, but not be selected
   */
  disabled?: boolean
}

export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'style' | 'onSelect'> {
  items: TreeNode[]

  /**
   * Ids of the expanded nodes, for a controlled tree
   */
  expanded?: string[]

  /**
   * Ids of the nodes an uncontrolled tree starts expanded
   * @default []
   */
  defaultExpanded?: string[]

  /**
   * Called when the user expands or collapses a node, with the ids of the expanded nodes
   */
  onExpandedChange?(expanded: string[]): void

  /**
   * Id of the selected node, for a controlled tree
   */
  selected?: string | null

  /**
   * Id of the node an uncontrolled tree starts selected
   */
  defaultSelected?: string | null

  /**
   * Called when the user selects a node, by a click, Enter or Space
   */
  onSelectedChange?(id: string, node: TreeNode): void

  style?: ExternalStyles
}

interface VisibleNode {
  node: TreeNode
  parentId: string | null
}

const textOf = (node: TreeNode) => node.textValue ?? (typeof node.label === 'string' ? node.label : '')

/**
 * Nested items that expand and collapse, such as folders, categories or the parts of an organization.
 * Name it with `aria-label`.
 */
export function TreeView(props: TreeViewProps) {
  const {
    items,
    expanded,
    defaultExpanded = [],
    onExpandedChange,
    selected,
    defaultSelected = null,
    onSelectedChange,
    onKeyDown,
    onFocus,
    style,
    ...rest
  } = props

  const { classes, css } = useStyles(createStyles)
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [internalSelected, setInternalSelected] = useState(defaultSelected)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const itemRefs = useRef(new Map<string, HTMLLIElement>())
  const baseId = useMemo(() => `tree-${randomStr()}`, [])
  const labelIdOf = (node: TreeNode) => `${baseId}-${node.id.replace(/[^\w-]/g, '_')}-label`

  const expandedIds = expanded ?? internalExpanded
  const selectedId = selected !== undefined ? selected : internalSelected

  // The nodes the user can reach, in the order they appear
  const visible = useMemo(() => {
    const open = new Set(expandedIds)
    const list: VisibleNode[] = []
    const walk = (nodes: TreeNode[], parentId: string | null) =>
      nodes.forEach((node) => {
        list.push({ node, parentId })
        if (node.children && node.children.length > 0 && open.has(node.id)) {
          walk(node.children, node.id)
        }
      })
    walk(items, null)
    return list
  }, [items, expandedIds])

  const isVisible = (id: string | null) => id !== null && visible.some((entry) => entry.node.id === id)
  // Only one node is reachable by Tab: the focused one, else the selected one, else the first
  const tabbableId = isVisible(focusedId)
    ? focusedId
    : isVisible(selectedId)
    ? selectedId
    : visible.length > 0
    ? visible[0].node.id
    : null

  const setExpanded = (next: string[]) => {
    if (expanded === undefined) {
      setInternalExpanded(next)
    }
    onExpandedChange && onExpandedChange(next)
  }

  const toggle = (node: TreeNode, open?: boolean) => {
    const isOpen = expandedIds.includes(node.id)
    const shouldOpen = open ?? !isOpen
    if (shouldOpen !== isOpen) {
      setExpanded(shouldOpen ? [...expandedIds, node.id] : expandedIds.filter((id) => id !== node.id))
    }
  }

  const select = (node: TreeNode) => {
    if (node.disabled) {
      return
    }
    if (selected === undefined) {
      setInternalSelected(node.id)
    }
    onSelectedChange && onSelectedChange(node.id, node)
  }

  const focusNode = (id: string) => {
    setFocusedId(id)
    const element = itemRefs.current.get(id)
    element && element.focus()
  }

  const activate = (node: TreeNode) => {
    select(node)
    if (node.children && node.children.length > 0) {
      toggle(node)
    }
  }

  const idOf = (target: EventTarget) => {
    const item = (target as HTMLElement).closest('[role="treeitem"]') as HTMLElement | null
    return item ? item.getAttribute('data-id') : null
  }

  const handleFocus = (e: React.FocusEvent<HTMLUListElement>) => {
    onFocus && onFocus(e)
    const id = idOf(e.target)
    id && setFocusedId(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown && onKeyDown(e)

    const id = idOf(e.target)
    const index = visible.findIndex((entry) => entry.node.id === id)
    if (e.defaultPrevented || index < 0) {
      return
    }

    const { node, parentId } = visible[index]
    const hasChildren = !!node.children && node.children.length > 0
    const isOpen = hasChildren && expandedIds.includes(node.id)

    const handled = () => e.preventDefault()

    switch (e.key) {
      case 'ArrowDown':
        handled()
        index < visible.length - 1 && focusNode(visible[index + 1].node.id)
        return
      case 'ArrowUp':
        handled()
        index > 0 && focusNode(visible[index - 1].node.id)
        return
      case 'ArrowRight':
        handled()
        if (hasChildren && !isOpen) {
          toggle(node, true)
        } else if (isOpen) {
          focusNode(node.children[0].id)
        }
        return
      case 'ArrowLeft':
        handled()
        if (isOpen) {
          toggle(node, false)
        } else if (parentId) {
          focusNode(parentId)
        }
        return
      case 'Home':
        handled()
        focusNode(visible[0].node.id)
        return
      case 'End':
        handled()
        focusNode(visible[visible.length - 1].node.id)
        return
      case 'Enter':
      case ' ':
        handled()
        activate(node)
        return
    }

    // Typing a letter moves to the next node that starts with it
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const key = e.key.toLowerCase()
      const ordered = [...visible.slice(index + 1), ...visible.slice(0, index)]
      const match = ordered.find((entry) => textOf(entry.node).toLowerCase().startsWith(key))
      if (match) {
        handled()
        focusNode(match.node.id)
      }
    }
  }

  const renderNodes = (nodes: TreeNode[], level: number) =>
    nodes.map((node, index) => {
      const hasChildren = !!node.children && node.children.length > 0
      const isOpen = hasChildren && expandedIds.includes(node.id)
      const isSelected = node.id === selectedId

      return (
        <li
          key={node.id}
          ref={(element) => (element ? itemRefs.current.set(node.id, element) : itemRefs.current.delete(node.id))}
          data-id={node.id}
          role='treeitem'
          aria-level={level}
          aria-setsize={nodes.length}
          aria-posinset={index + 1}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={isSelected}
          aria-disabled={node.disabled || undefined}
          // Named by its own label, not by the labels of its children
          aria-labelledby={labelIdOf(node)}
          tabIndex={node.id === tabbableId ? 0 : -1}
          className={classes.item}
        >
          <div
            className={css(classes.row, isSelected && classes.selected, node.disabled && classes.disabled)}
            style={{ paddingLeft: `${0.5 + (level - 1) * 1.5}rem` }}
            onClick={() => activate(node)}
          >
            <span className={classes.toggle}>
              {hasChildren && <Icon icon='angleRight' size={1} style={css(classes.chevron, isOpen && classes.open)} />}
            </span>
            {node.icon && <Icon icon={node.icon} size={1.25} />}
            <span id={labelIdOf(node)} className={classes.label}>
              {node.label}
            </span>
          </div>
          {isOpen && (
            <ul role='group' className={classes.group}>
              {renderNodes(node.children, level + 1)}
            </ul>
          )}
        </li>
      )
    })

  return (
    <ul role='tree' className={css(classes.tree, style)} onKeyDown={handleKeyDown} onFocus={handleFocus} {...rest}>
      {renderNodes(items, 1)}
    </ul>
  )
}

const createStyles = (theme: Theme) => ({
  tree: {
    ...theme.typography.variant('main'),
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as CSSProperties,
  group: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as CSSProperties,
  item: {
    outline: 'none',
    // The ring goes around the row of the focused node only, not around its children
    '&:focus > div': {
      boxShadow: focusBoxShadow(theme, 'primary', 'inset'),
    },
  } as CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '2rem',
    paddingRight: '0.5rem',
    borderRadius: theme.radius.button,
    color: theme.pallete.text.main,
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
      background: theme.pallete.surface.background,
    },
  } as CSSProperties,
  selected: {
    background: theme.pallete.primary.c90,
    color: theme.pallete.primary.c30,
    fontWeight: 'bold',
    '&:hover': {
      background: theme.pallete.primary.c90,
    },
  } as CSSProperties,
  disabled: {
    color: theme.pallete.text.disabled,
    cursor: 'not-allowed',
  } as CSSProperties,
  toggle: {
    display: 'inline-flex',
    flexShrink: 0,
    width: '1rem',
  } as CSSProperties,
  chevron: {
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  open: {
    transform: 'rotate(90deg)',
  } as CSSProperties,
  label: {
    minWidth: 0,
    overflowWrap: 'anywhere',
  } as CSSProperties,
})
