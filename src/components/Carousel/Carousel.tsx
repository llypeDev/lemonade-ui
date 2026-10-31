import React, { CSSProperties, useEffect, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Icon } from '../Icon'

export interface CarouselProps {
  /**
   * The slides, one per child
   */
  children: React.ReactNode

  /**
   * What the carousel shows, for screen readers, such as "Featured products"
   */
  label: string

  /**
   * Changes the slides by themselves. A button pauses them, and they also pause while the pointer or the focus is
   * on the carousel. They start paused when the user prefers reduced motion.
   * @default false
   */
  autoPlay?: boolean

  /**
   * Time each slide shows when they change by themselves, in milliseconds
   * @default 6000
   */
  interval?: number

  /**
   * Index of the slide shown, for a controlled carousel
   */
  index?: number

  /**
   * Slide an uncontrolled carousel starts on
   * @default 0
   */
  defaultIndex?: number

  /**
   * Called with the index of the new slide
   */
  onIndexChange?(index: number): void

  /**
   * Goes from the last slide back to the first, and the other way around
   * @default true
   */
  loop?: boolean

  style?: ExternalStyles
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A drag shorter than this, in pixels, is a click, not a swipe
const swipeDistance = 50

/**
 * Slides shown one at a time, with buttons to go back and forth, such as featured products or the steps of a
 * welcome screen. Prefer showing the content side by side when it fits; users often miss slides they do not see.
 */
export function Carousel(props: CarouselProps) {
  const {
    children,
    label,
    autoPlay = false,
    interval = 6000,
    index,
    defaultIndex = 0,
    onIndexChange,
    loop = true,
    style,
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const slides = React.Children.toArray(children)
  const total = slides.length

  const [internalIndex, setInternalIndex] = useState(defaultIndex)
  const [playing, setPlaying] = useState(() => autoPlay && !reducedMotion())
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const swipeStart = useRef<number>(null)

  const current = Math.max(0, Math.min(total - 1, index ?? internalIndex))
  const rotating = playing && !hovered && !focused

  const goTo = (next: number) => {
    const target = loop ? (next + total) % total : Math.max(0, Math.min(total - 1, next))
    if (target === current) {
      return
    }
    if (index === undefined) {
      setInternalIndex(target)
    }
    onIndexChange && onIndexChange(target)
  }

  // The latest goTo, for the timer that changes the slides
  const advance = useRef(() => undefined)
  advance.current = () => goTo(current + 1)

  useEffect(() => {
    if (!rotating || total < 2) {
      return
    }
    const timer = setInterval(() => advance.current(), interval)
    return () => clearInterval(timer)
  }, [rotating, interval, total])

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget as Node
    if (!next || !e.currentTarget.contains(next)) {
      setFocused(false)
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    swipeStart.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (start === null) {
      return
    }
    const distance = e.clientX - start
    if (Math.abs(distance) >= swipeDistance) {
      goTo(distance < 0 ? current + 1 : current - 1)
    }
  }

  const atStart = !loop && current === 0
  const atEnd = !loop && current === total - 1

  return (
    <section
      aria-roledescription='carousel'
      aria-label={label}
      className={css(classes.root, style)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    >
      {/* The controls come first, so the keyboard reaches the pause button before the slides */}
      <div className={classes.controls}>
        {autoPlay && (
          <button
            type='button'
            className={css(classes.button, classes.rotation)}
            aria-label={playing ? locale.carousel.pause : locale.carousel.play}
            title={playing ? locale.carousel.pause : locale.carousel.play}
            onClick={() => setPlaying(!playing)}
          >
            <Icon icon={playing ? 'pause' : 'playOutline'} size={1.25} />
          </button>
        )}
        {total > 1 && (
          <div className={classes.dots}>
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                type='button'
                className={css(classes.dot, slideIndex === current && classes.dotActive)}
                aria-label={fill(locale.carousel.goTo, { current: slideIndex + 1, total })}
                aria-current={slideIndex === current || undefined}
                onClick={() => goTo(slideIndex)}
              />
            ))}
          </div>
        )}
      </div>

      <div className={classes.viewport} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <div
          className={classes.track}
          style={{ transform: `translateX(-${current * 100}%)` }}
          // Changes by the timer are not announced; changes by the user are
          aria-live={rotating ? 'off' : 'polite'}
        >
          {slides.map((slide, slideIndex) => {
            const hidden = slideIndex !== current
            return (
              <div
                key={slideIndex}
                role='group'
                aria-roledescription='slide'
                aria-label={fill(locale.carousel.slide, { current: slideIndex + 1, total })}
                aria-hidden={hidden || undefined}
                // Hidden slides keep their links out of the keyboard order
                {...(hidden ? { inert: '' } : {})}
                className={classes.slide}
              >
                {slide}
              </div>
            )
          })}
        </div>
        {total > 1 && (
          <>
            <button
              type='button'
              className={css(classes.button, classes.arrow, classes.previous)}
              aria-label={locale.carousel.previous}
              title={locale.carousel.previous}
              disabled={atStart}
              onClick={() => goTo(current - 1)}
            >
              <Icon icon='angleLeft' size={1.5} />
            </button>
            <button
              type='button'
              className={css(classes.button, classes.arrow, classes.next)}
              aria-label={locale.carousel.next}
              title={locale.carousel.next}
              disabled={atEnd}
              onClick={() => goTo(current + 1)}
            >
              <Icon icon='angleRight' size={1.5} />
            </button>
          </>
        )}
      </div>
    </section>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    ...theme.typography.variant('main'),
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  } as CSSProperties,
  controls: {
    // Shown under the slides, though first for the keyboard
    order: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    position: 'relative',
    minHeight: '2rem',
    marginTop: '0.5rem',
  } as CSSProperties,
  rotation: {
    position: 'absolute',
    left: 0,
    width: '2rem',
    height: '2rem',
  } as CSSProperties,
  dots: {
    display: 'flex',
    gap: '0.25rem',
  } as CSSProperties,
  dot: {
    width: '1.5rem',
    height: '1.5rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: '50%',
    background: 'transparent',
    cursor: 'pointer',
    outline: 'none',
    // The visible dot is smaller than the area that takes the click
    '&::before': {
      content: '""',
      display: 'block',
      width: '0.625rem',
      height: '0.625rem',
      margin: 'auto',
      borderRadius: '50%',
      border: `1px solid ${theme.pallete.gray.c50}`,
      boxSizing: 'border-box',
    },
    '&:hover::before': {
      background: theme.pallete.gray.c80,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  dotActive: {
    '&::before, &:hover::before': {
      borderColor: theme.pallete.primary.main,
      background: theme.pallete.primary.main,
    },
  } as CSSProperties,
  viewport: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.radius.paper,
    touchAction: 'pan-y',
  } as CSSProperties,
  track: {
    display: 'flex',
    transition: 'transform .4s ease',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  slide: {
    flex: '0 0 100%',
    minWidth: 0,
  } as CSSProperties,
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: '50%',
    background: theme.pallete.surface.main,
    color: theme.pallete.text.main,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background .2s',
    '&:hover:not(:disabled)': {
      background: theme.pallete.surface.background,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  } as CSSProperties,
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2.5rem',
    height: '2.5rem',
    boxShadow: theme.shadows.outer[20],
  } as CSSProperties,
  previous: {
    left: '0.5rem',
  } as CSSProperties,
  next: {
    right: '0.5rem',
  } as CSSProperties,
})
