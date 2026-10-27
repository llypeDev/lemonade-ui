import { Theme, useStyles } from '@lemonade/ui'
import React, { CSSProperties, useEffect, useRef, useState } from 'react'

import { innerMarkup, PhosphorEntry, WeightShapes } from './data'

const PAGE_SIZE = 180

export interface PhosphorGridProps {
  icons: PhosphorEntry[]
  shapes: WeightShapes
  size: number
  color: string
  inverted: boolean
  selected: string
  onSelect(entry: PhosphorEntry): void
}

/**
 * Grid of icon buttons. Rows are rendered incrementally as the user scrolls, so the first paint stays fast even
 * with ~1,500 icons on screen.
 */
export function PhosphorGrid(props: PhosphorGridProps) {
  const { icons, shapes, size, color, inverted, selected, onSelect } = props
  const { classes, css } = useStyles(createStyles, size, inverted)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => setVisible(PAGE_SIZE), [icons])

  useEffect(() => {
    const node = sentinel.current
    if (!node || visible >= icons.length || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => entries.some((entry) => entry.isIntersecting) && setVisible((count) => count + PAGE_SIZE),
      { rootMargin: '600px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, icons.length])

  const rendered = typeof IntersectionObserver === 'undefined' ? icons : icons.slice(0, visible)

  return (
    <>
      <ul className={classes.grid}>
        {rendered.map((entry) => {
          const iconShapes = shapes[entry.name]
          const isSelected = entry.name === selected
          return (
            <li key={entry.name} className={classes.cell}>
              <button
                type='button'
                className={css(classes.item, isSelected && classes.selected)}
                aria-pressed={isSelected}
                data-icon={entry.name}
                onClick={() => onSelect(entry)}
              >
                {iconShapes ? (
                  <svg
                    className={classes.svg}
                    width={size}
                    height={size}
                    viewBox='0 0 256 256'
                    fill={color}
                    aria-hidden='true'
                    focusable='false'
                    dangerouslySetInnerHTML={{ __html: innerMarkup(iconShapes) }}
                  />
                ) : (
                  <span className={classes.placeholder} />
                )}
                <span className={classes.name}>{entry.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {rendered.length < icons.length && <div ref={sentinel} className={classes.sentinel} aria-hidden='true' />}
    </>
  )
}

const createStyles = (theme: Theme, size: number, inverted: boolean) => {
  const cell = Math.max(112, size + 64)
  return {
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${cell}px, 1fr))`,
      gap: '0.5rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    } as CSSProperties,
    cell: {
      margin: 0,
      minWidth: 0,
    } as CSSProperties,
    item: {
      width: '100%',
      height: cell,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '0.75rem 0.5rem',
      border: `1px solid transparent`,
      borderRadius: theme.radius.button,
      background: inverted ? theme.pallete.gray.c10 : 'transparent',
      color: inverted ? theme.pallete.gray.c100 : theme.pallete.text.main,
      cursor: 'pointer',
      fontFamily: theme.typography.fontFamily,
      transition: 'background .15s, border-color .15s',
      '&:hover': {
        background: inverted ? theme.pallete.gray.c20 : theme.pallete.surface.background,
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme.pallete.surface.main}, 0 0 0 4px ${theme.pallete.primary.main}`,
      },
    } as CSSProperties,
    selected: {
      borderColor: theme.pallete.primary.main,
      background: inverted ? theme.pallete.gray.c20 : theme.pallete.primary.c90,
    } as CSSProperties,
    svg: {
      flexShrink: 0,
    } as CSSProperties,
    placeholder: {
      width: size,
      height: size,
      borderRadius: 4,
      background: theme.pallete.gray.c90,
      flexShrink: 0,
    } as CSSProperties,
    name: {
      fontSize: '0.75rem',
      lineHeight: 1.3,
      textAlign: 'center',
      color: inverted ? theme.pallete.gray.c80 : theme.pallete.text.secondary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
    } as CSSProperties,
    sentinel: {
      height: 1,
    } as CSSProperties,
  }
}
