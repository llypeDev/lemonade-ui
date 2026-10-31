import FocusTrap from 'focus-trap-react'
import React, { CSSProperties, useEffect, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { Theme, useStyles } from '../../styles'
import { zIndexLevel } from '../../styles/theme/zIndex'
import { Icon, IconImage } from '../Icon'
import { Portal } from '../Portal'
import { VisuallyHidden } from '../VisuallyHidden'

export interface ImageViewerImage {
  src: string

  /**
   * What the image shows, for screen readers
   */
  alt: string

  /**
   * Text under the image
   */
  caption?: React.ReactNode
}

export interface ImageViewerProps {
  images: ImageViewerImage[]

  open: boolean

  /**
   * Called by the close button, `Escape` and a click outside the image
   */
  onClose(): void

  /**
   * Index of the image shown, for a controlled viewer
   */
  index?: number

  /**
   * Image an uncontrolled viewer shows each time it opens
   * @default 0
   */
  defaultIndex?: number

  /**
   * Called with the index of the new image when the user goes to another one
   */
  onIndexChange?(index: number): void
}

const zoomLevels = [1, 1.5, 2, 3, 4]

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))

/**
 * Shows images over the whole screen, such as the photos of a product or the attachments of a message, with
 * zoom and the previous and next images. Arrow keys go through the images, `+` and `-` zoom, and `Escape` closes.
 */
export function ImageViewer(props: ImageViewerProps) {
  const { images, open, onClose, index, defaultIndex = 0, onIndexChange } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; y: number; startX: number; startY: number; moved: boolean }>(null)

  const [internalIndex, setInternalIndex] = useState(defaultIndex)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const current = Math.max(0, Math.min(images.length - 1, index ?? internalIndex))
  const image = images[current]
  const zoomed = zoom > 1

  // An uncontrolled viewer starts again on opening; the focus goes back where it was when it closes
  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement
      setInternalIndex(defaultIndex)
      closeRef.current && closeRef.current.focus()

      const overflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = overflow
        const element = returnFocus.current
        element && element.focus && document.contains(element) && element.focus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Each image starts fitted to the screen
  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [current, open])

  if (!open || !image) {
    return null
  }

  const goTo = (next: number) => {
    const target = Math.max(0, Math.min(images.length - 1, next))
    if (target === current) {
      return
    }
    if (index === undefined) {
      setInternalIndex(target)
    }
    onIndexChange && onIndexChange(target)
  }

  const changeZoom = (direction: 1 | -1) => {
    const position = zoomLevels.indexOf(zoom)
    const next = zoomLevels[Math.max(0, Math.min(zoomLevels.length - 1, position + direction))]
    setZoom(next)
    if (next === 1) {
      setOffset({ x: 0, y: 0 })
    }
  }

  const resetZoom = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const pan = (x: number, y: number) => setOffset({ x: offset.x + x, y: offset.y + y })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 50
    const actions: Record<string, () => void> = {
      Escape: onClose,
      ArrowLeft: () => (zoomed ? pan(step, 0) : goTo(current - 1)),
      ArrowRight: () => (zoomed ? pan(-step, 0) : goTo(current + 1)),
      ArrowUp: () => zoomed && pan(0, step),
      ArrowDown: () => zoomed && pan(0, -step),
      Home: () => goTo(0),
      End: () => goTo(images.length - 1),
      '+': () => changeZoom(1),
      '=': () => changeZoom(1),
      '-': () => changeZoom(-1),
      '0': resetZoom,
    }

    if (actions[e.key]) {
      e.preventDefault()
      e.stopPropagation()
      actions[e.key]()
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      changeZoom(e.deltaY < 0 ? 1 : -1)
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!zoomed || e.button !== 0) {
      return
    }
    e.preventDefault()
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: offset.x, y: offset.y, startX: e.clientX, startY: e.clientY, moved: false }
    setDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    const state = drag.current
    if (state) {
      const dx = e.clientX - state.startX
      const dy = e.clientY - state.startY
      state.moved = state.moved || Math.abs(dx) + Math.abs(dy) > 3
      setOffset({ x: state.x + dx, y: state.y + dy })
    }
  }

  const handlePointerUp = () => {
    drag.current = null
    setDragging(false)
  }

  // A click on the dark area around the image closes the viewer
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const toolButton = (icon: IconImage, label: string, onClick: () => void, disabled = false, ref?: any) => (
    <button
      ref={ref}
      type='button'
      className={classes.button}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon icon={icon} size={1.5} />
    </button>
  )

  const counter = fill(locale.imageViewer.counter, { current: current + 1, total: images.length })

  return (
    <Portal>
      <FocusTrap focusTrapOptions={{ fallbackFocus: () => closeRef.current, escapeDeactivates: false }}>
        <div
          role='dialog'
          aria-modal='true'
          aria-label={locale.imageViewer.label}
          className={classes.overlay}
          onKeyDown={handleKeyDown}
        >
          <div className={classes.toolbar}>
            <span className={classes.counter} aria-hidden>
              {images.length > 1 ? counter : ''}
            </span>
            {toolButton('zoomMinusOutline', locale.imageViewer.zoomOut, () => changeZoom(-1), zoom === 1)}
            {toolButton('zoomOutline', locale.imageViewer.resetZoom, resetZoom, zoom === 1)}
            {toolButton(
              'zoomPlusOutline',
              locale.imageViewer.zoomIn,
              () => changeZoom(1),
              zoom === zoomLevels[zoomLevels.length - 1]
            )}
            {toolButton('timesDefault', locale.imageViewer.close, onClose, false, closeRef)}
          </div>

          <div className={classes.stage} onClick={handleStageClick} onWheel={handleWheel}>
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              draggable={false}
              className={css(classes.image, zoomed && classes.zoomed, dragging && classes.dragging)}
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
              onDoubleClick={() => (zoomed ? resetZoom() : setZoom(2))}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
            {images.length > 1 && (
              <>
                <div className={css(classes.side, classes.previous)}>
                  {toolButton('angleLeft', locale.imageViewer.previous, () => goTo(current - 1), current === 0)}
                </div>
                <div className={css(classes.side, classes.next)}>
                  {toolButton(
                    'angleRight',
                    locale.imageViewer.next,
                    () => goTo(current + 1),
                    current === images.length - 1
                  )}
                </div>
              </>
            )}
          </div>

          {image.caption && <p className={classes.caption}>{image.caption}</p>}

          <VisuallyHidden role='status'>{images.length > 1 ? `${counter}. ${image.alt}` : image.alt}</VisuallyHidden>
        </div>
      </FocusTrap>
    </Portal>
  )
}

const createStyles = (theme: Theme) => ({
  overlay: {
    ...theme.typography.variant('main'),
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndexLevel[2].modalContainer,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(0, 0, 0, 0.9)',
    color: '#FFFFFF',
  } as CSSProperties,
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.25rem',
    padding: '0.5rem',
  } as CSSProperties,
  counter: {
    flex: 1,
    paddingLeft: '0.5rem',
    fontWeight: 'bold',
  } as CSSProperties,
  stage: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '0 3.5rem',
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  } as CSSProperties,
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    userSelect: 'none',
    cursor: 'zoom-in',
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  zoomed: {
    cursor: 'grab',
    touchAction: 'none',
  } as CSSProperties,
  dragging: {
    cursor: 'grabbing',
    transition: 'none',
  } as CSSProperties,
  side: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  } as CSSProperties,
  previous: {
    left: '0.5rem',
  } as CSSProperties,
  next: {
    right: '0.5rem',
  } as CSSProperties,
  caption: {
    margin: 0,
    padding: '0.75rem 1rem 1rem',
    textAlign: 'center',
  } as CSSProperties,
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: theme.radius.button,
    background: 'rgba(0, 0, 0, 0.4)',
    color: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background .2s',
    '&:hover:not(:disabled)': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
    '&:focus': {
      boxShadow: '0 0 0 2px #FFFFFF',
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  } as CSSProperties,
})
