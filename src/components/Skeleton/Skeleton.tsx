import { keyframes } from 'emotion'
import React, { CSSProperties } from 'react'

import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'

export type SkeletonVariant = 'text' | 'rectangle' | 'circle'

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'style'> {
  /**
   * `text` follows the font size of its container, `rectangle` and `circle` need a size
   * @default 'text'
   */
  variant?: SkeletonVariant

  /**
   * Width as a CSS value, or pixels when it is a number
   * @default '100%' for text and rectangle
   */
  width?: number | string

  /**
   * Height as a CSS value, or pixels when it is a number. A `circle` uses `width` when this is missing.
   */
  height?: number | string

  /**
   * Number of text lines. The last one is shorter, like the end of a paragraph.
   * @default 1
   */
  lines?: number

  /**
   * Shows the shimmer animation. It never plays when the user prefers reduced motion.
   * @default true
   */
  animated?: boolean

  style?: ExternalStyles
}

/**
 * Placeholder with the shape of content that is still loading. It is hidden from screen readers:
 * mark the loading region with `aria-busy` and give it a loading message instead.
 */
export function Skeleton(props: SkeletonProps) {
  const { variant = 'text', width, height, lines = 1, animated = true, style, ...rest } = props
  const { classes, css } = useStyles(createStyles)

  const boneClassName = (lineWidth?: number | string) =>
    css(
      classes.bone,
      classes[variant],
      animated && classes.animated,
      {
        width: lineWidth ?? width ?? (variant === 'circle' ? height : undefined),
        height: height ?? (variant === 'circle' ? width : undefined),
      },
      lines <= 1 && style
    )

  if (variant === 'text' && lines > 1) {
    return (
      <span aria-hidden='true' className={css(classes.lines, style)} {...rest}>
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className={boneClassName(index === lines - 1 ? '60%' : undefined)} />
        ))}
      </span>
    )
  }

  return <span aria-hidden='true' className={boneClassName()} {...rest} />
}

const shimmer = keyframes({
  from: { backgroundPosition: '100% 0' },
  to: { backgroundPosition: '-100% 0' },
})

const createStyles = (theme: Theme) => ({
  lines: {
    display: 'block',
  } as CSSProperties,
  bone: {
    display: 'block',
    background: theme.pallete.gray.c90,
  } as CSSProperties,
  text: {
    width: '100%',
    height: '1em',
    margin: '0.25em 0',
    borderRadius: theme.radius.input,
  } as CSSProperties,
  rectangle: {
    width: '100%',
    height: '1em',
    borderRadius: theme.radius.paper,
  } as CSSProperties,
  circle: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    flexShrink: 0,
  } as CSSProperties,
  animated: {
    backgroundImage: `linear-gradient(90deg, ${theme.pallete.gray.c90} 25%, ${theme.pallete.gray.c80} 50%, ${theme.pallete.gray.c90} 75%)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 1.5s linear infinite`,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
    },
  } as CSSProperties,
})
