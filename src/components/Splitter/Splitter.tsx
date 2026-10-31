import React, { CSSProperties, useMemo, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'

export interface SplitterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  /**
   * The two panels, in order
   */
  children: [React.ReactNode, React.ReactNode]

  /**
   * `horizontal` puts the panels side by side, and `vertical` puts one above the other
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'

  /**
   * Size of the first panel, in percent of the splitter, for a controlled splitter
   */
  size?: number

  /**
   * Size of the first panel an uncontrolled splitter starts with, in percent
   * @default 50
   */
  defaultSize?: number

  /**
   * Called with the new size of the first panel, in percent, while the user moves the divider
   */
  onSizeChange?(size: number): void

  /**
   * Smallest size of the first panel, in percent
   * @default 10
   */
  min?: number

  /**
   * Largest size of the first panel, in percent
   * @default 90
   */
  max?: number

  /**
   * How much an arrow key moves the divider, in percent
   * @default 5
   */
  step?: number

  /**
   * Name of the divider for screen readers, such as "Resize the folder list"
   * @default "Resize panels", from the locale strings
   */
  label?: string

  style?: ExternalStyles
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Two panels with a divider between them that the user drags, or moves with the arrow keys, to resize them,
 * such as a list beside the details of the selected item. Give the splitter a height when the panels are side
 * by side in a page that scrolls, or one above the other.
 */
export function Splitter(props: SplitterProps) {
  const {
    children,
    direction = 'horizontal',
    size,
    defaultSize = 50,
    onSizeChange,
    min = 10,
    max = 90,
    step = 5,
    label,
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalSize, setInternalSize] = useState(defaultSize)
  const [dragging, setDragging] = useState(false)
  // Size to go back to after Enter collapses the first panel
  const restoreSize = useRef<number>(null)
  const panelId = useMemo(() => `splitter-panel-${randomStr()}`, [])

  const horizontal = direction === 'horizontal'
  const current = clamp(size ?? internalSize, min, max)

  const resize = (next: number) => {
    const value = Math.round(clamp(next, min, max) * 10) / 10
    if (value === current) {
      return
    }
    if (size === undefined) {
      setInternalSize(value)
    }
    onSizeChange && onSizeChange(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const decrease = horizontal ? 'ArrowLeft' : 'ArrowUp'
    const increase = horizontal ? 'ArrowRight' : 'ArrowDown'

    switch (e.key) {
      case decrease:
        resize(current - step)
        break
      case increase:
        resize(current + step)
        break
      case 'Home':
        resize(min)
        break
      case 'End':
        resize(max)
        break
      case 'Enter':
        // Collapses the first panel to its smallest size, and a second Enter brings it back
        if (current > min) {
          restoreSize.current = current
          resize(min)
        } else if (restoreSize.current !== null) {
          resize(restoreSize.current)
          restoreSize.current = null
        }
        break
      default:
        return
    }
    e.preventDefault()
  }

  const sizeAt = (e: React.PointerEvent) => {
    const rect = rootRef.current.getBoundingClientRect()
    return horizontal ? ((e.clientX - rect.left) / rect.width) * 100 : ((e.clientY - rect.top) / rect.height) * 100
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return
    }
    // Keeps the drag from selecting the text of the panels
    e.preventDefault()
    e.currentTarget.focus()
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId)
    restoreSize.current = null
    setDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) {
      resize(sizeAt(e))
    }
  }

  const stopDragging = () => setDragging(false)

  return (
    <div
      ref={rootRef}
      className={css(classes.root, !horizontal && classes.vertical, dragging && classes.dragging, style)}
      {...rest}
    >
      <div id={panelId} className={classes.panel} style={{ flexBasis: `${current}%` }}>
        {children[0]}
      </div>
      {/* A focusable separator has a value since ARIA 1.1, which this lint rule does not know yet */}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <div
        role='separator'
        tabIndex={0}
        aria-label={label ?? locale.splitter.resize}
        aria-controls={panelId}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={Math.round(current)}
        aria-valuemin={min}
        aria-valuemax={max}
        data-dragging={dragging || undefined}
        className={css(classes.separator, horizontal ? classes.separatorHorizontal : classes.separatorVertical)}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <span className={css(classes.grip, horizontal ? classes.gripHorizontal : classes.gripVertical)} />
      </div>
      <div className={css(classes.panel, classes.rest)}>{children[1]}</div>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  } as CSSProperties,
  vertical: {
    flexDirection: 'column',
  } as CSSProperties,
  dragging: {
    userSelect: 'none',
  } as CSSProperties,
  panel: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto',
  } as CSSProperties,
  rest: {
    flex: '1 1 0',
  } as CSSProperties,
  separator: {
    position: 'relative',
    flexShrink: 0,
    background: theme.pallete.divider,
    outline: 'none',
    touchAction: 'none',
    transition: 'background .2s',
    zIndex: 1,
    // A wider area than the line catches the pointer
    '&::after': {
      content: '""',
      position: 'absolute',
    },
    '&:hover, &[data-dragging]': {
      background: theme.pallete.primary.main,
    },
    '&:hover > span, &[data-dragging] > span': {
      borderColor: theme.pallete.primary.main,
    },
    '&:focus > span': {
      borderColor: theme.pallete.primary.main,
      boxShadow: focusBoxShadow(theme),
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  separatorHorizontal: {
    width: 1,
    cursor: 'col-resize',
    '&::after': {
      top: 0,
      bottom: 0,
      left: -4,
      right: -4,
    },
  } as CSSProperties,
  separatorVertical: {
    height: 1,
    cursor: 'row-resize',
    '&::after': {
      left: 0,
      right: 0,
      top: -4,
      bottom: -4,
    },
  } as CSSProperties,
  grip: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxSizing: 'border-box',
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: 4,
    background: theme.pallete.surface.main,
    transition: 'border-color .2s, box-shadow .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  gripHorizontal: {
    width: '0.5rem',
    height: '2rem',
  } as CSSProperties,
  gripVertical: {
    width: '2rem',
    height: '0.5rem',
  } as CSSProperties,
})
