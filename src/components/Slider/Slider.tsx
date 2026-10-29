import React, { CSSProperties, useMemo, useRef, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { randomStr } from '../../util/string'
import { FormError } from '../FormControl'
import { VisuallyHidden } from '../VisuallyHidden'

export type SliderValue = number | [number, number]

// Makes the callbacks take the type of `value` or `defaultValue`, so a state setter fits them
type NoInfer<T> = [T][T extends any ? 0 : never]

export interface SliderProps<T extends SliderValue = number>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'defaultValue' | 'onChange'> {
  /**
   * Current value, for a controlled slider. Use a pair, such as `[20, 80]`, for a range with two thumbs.
   */
  value?: T

  /**
   * Starting value of an uncontrolled slider. Use a pair, such as `[20, 80]`, for a range with two thumbs.
   * @default min
   */
  defaultValue?: T

  /**
   * Called on every change, while the user drags a thumb or presses a key
   */
  onChange?(value: NoInfer<T>): void

  /**
   * Called when the user releases a thumb or changes the value with the keyboard. Use it for costly work,
   * such as a new search, instead of `onChange`.
   */
  onChangeEnd?(value: NoInfer<T>): void

  /**
   * @default 0
   */
  min?: number

  /**
   * @default 100
   */
  max?: number

  /**
   * Interval between the values the user can pick
   * @default 1
   */
  step?: number

  /**
   * Text above the slider, which also names it for screen readers.
   * Without it, name the slider with `aria-label` or `aria-labelledby`.
   */
  label?: React.ReactNode

  /**
   * Shows the current value above the slider, on the right
   * @default true
   */
  showValue?: boolean

  /**
   * Shows the minimum and the maximum below the slider
   * @default false
   */
  showLimits?: boolean

  /**
   * Text of a value, such as `R$ 50` or `50%`, shown on the screen and read by screen readers
   */
  formatValue?(value: number): string

  /**
   * Names of the two thumbs of a range, read by screen readers after the name of the slider
   * @default ['Minimum', 'Maximum'], from the locale strings
   */
  thumbLabels?: [string, string]

  /**
   * Name of the hidden inputs that send the value with a form. A range sends two values with this name.
   */
  name?: string

  disabled?: boolean

  error?: React.ReactNode

  style?: ExternalStyles
}

const countDecimals = (value: number) => {
  const text = String(value)
  const point = text.indexOf('.')
  return point < 0 ? 0 : text.length - point - 1
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Picks a number, or a range of numbers, by dragging a thumb along a track. Use it when the exact value
 * matters less than its position in the range, such as a price filter or a volume.
 */
export function Slider<T extends SliderValue = number>(props: SliderProps<T>) {
  const {
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = true,
    showLimits = false,
    formatValue,
    thumbLabels,
    name,
    disabled = false,
    error,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, disabled, !!error)

  const ids = useMemo(() => {
    const id = randomStr()
    return {
      label: `slider-label-${id}`,
      name: `slider-name-${id}`,
      thumb: `slider-thumb-${id}`,
      error: `slider-error-${id}`,
    }
  }, [])

  const isControlled = value !== undefined
  const isRange = Array.isArray(isControlled ? value : defaultValue)
  const toArray = (v: SliderValue | undefined): number[] =>
    v === undefined ? (isRange ? [min, max] : [min]) : Array.isArray(v) ? [...v] : [v]

  const [internalValues, setInternalValues] = useState(() => toArray(defaultValue))
  const values = isControlled ? toArray(value) : internalValues

  // The latest values, so a drag reads them between renders
  const valuesRef = useRef(values)
  valuesRef.current = values

  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  // Index of the thumb being dragged; 'undecided' while both thumbs are on the same spot and the pointer has not moved
  const dragRef = useRef<number | 'undecided' | null>(null)
  // Values when the drag started, so releasing the thumb where it was does not call onChangeEnd
  const dragStartRef = useRef<number[]>(values)
  const [dragging, setDragging] = useState<number | null>(null)

  const decimals = Math.max(countDecimals(step), countDecimals(min))
  const roundToStep = (v: number) =>
    clamp(Number((Math.round((v - min) / step) * step + min).toFixed(decimals)), min, max)
  const percent = (v: number) => (max > min ? ((clamp(v, min, max) - min) / (max - min)) * 100 : 0)
  const format = (v: number) => (formatValue ? formatValue(v) : String(v))
  const toOutput = (next: number[]) => (isRange ? [next[0], next[1]] : next[0]) as T

  const setThumb = (index: number, next: number) => {
    const current = valuesRef.current
    const bounded = !isRange ? next : index === 0 ? Math.min(next, current[1]) : Math.max(next, current[0])

    if (bounded === current[index]) {
      return false
    }

    const nextValues = [...current]
    nextValues[index] = bounded
    valuesRef.current = nextValues

    if (!isControlled) {
      setInternalValues(nextValues)
    }
    onChange && onChange(toOutput(nextValues))
    return true
  }

  const valueAt = (clientX: number) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = rect.width > 0 ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0
    return roundToStep(min + ratio * (max - min))
  }

  const pickThumb = (target: number): number | 'undecided' => {
    if (!isRange) {
      return 0
    }

    const [start, end] = valuesRef.current
    if (start === end) {
      return target < start ? 0 : target > end ? 1 : 'undecided'
    }

    return Math.abs(target - start) <= Math.abs(target - end) ? 0 : 1
  }

  const startDrag = (index: number) => {
    dragRef.current = index
    setDragging(index)
    thumbRefs[index].current.focus()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) {
      return
    }

    // Keeps the focus on the thumb and avoids selecting text while dragging
    e.preventDefault()
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId)
    dragStartRef.current = valuesRef.current

    const target = valueAt(e.clientX)
    const index = pickThumb(target)

    if (index === 'undecided') {
      dragRef.current = 'undecided'
      thumbRefs[1].current.focus()
      return
    }

    startDrag(index)
    setThumb(index, target)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current === null) {
      return
    }

    const target = valueAt(e.clientX)

    if (dragRef.current === 'undecided') {
      if (target === valuesRef.current[0]) {
        return
      }
      startDrag(target < valuesRef.current[0] ? 0 : 1)
    }

    setThumb(dragRef.current as number, target)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current === null) {
      return
    }

    const changed = valuesRef.current.some((v, index) => v !== dragStartRef.current[index])
    e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId)
    dragRef.current = null
    setDragging(null)
    changed && onChangeEnd && onChangeEnd(toOutput(valuesRef.current))
  }

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }

    const current = valuesRef.current[index]
    const bigStep = step * Math.max(1, Math.round((max - min) / step / 10))
    const nextByKey: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + bigStep,
      PageDown: current - bigStep,
      Home: min,
      End: max,
    }

    if (!(e.key in nextByKey)) {
      return
    }

    e.preventDefault()
    const changed = setThumb(index, roundToStep(nextByKey[e.key]))
    changed && onChangeEnd && onChangeEnd(toOutput(valuesRef.current))
  }

  const sliderNameId = label ? ids.label : ariaLabelledBy || (isRange && ariaLabel ? ids.name : undefined)
  const names = thumbLabels ?? [locale.slider.minimum, locale.slider.maximum]
  const valueText = values.map(format).join(' – ')
  const start = isRange ? percent(values[0]) : 0
  const end = percent(values[values.length - 1])

  return (
    <div className={css(classes.root, style)} {...rest}>
      {(label || showValue) && (
        <div className={classes.header}>
          {label && (
            // Like the label of a field, a click on it moves the focus to the slider
            <span id={ids.label} className={classes.label} onClick={() => !disabled && thumbRefs[0].current.focus()}>
              {label}
            </span>
          )}
          {showValue && <span className={classes.value}>{valueText}</span>}
        </div>
      )}

      {isRange && ariaLabel && !label && !ariaLabelledBy && <VisuallyHidden id={ids.name}>{ariaLabel}</VisuallyHidden>}

      <div
        className={classes.control}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div ref={trackRef} className={classes.track}>
          <div className={classes.fill} style={{ left: `${start}%`, width: `${end - start}%` }} />
          {values.map((v, index) => (
            <div
              key={index}
              ref={thumbRefs[index]}
              role='slider'
              tabIndex={disabled ? undefined : 0}
              aria-valuemin={isRange && index === 1 ? values[0] : min}
              aria-valuemax={isRange && index === 0 ? values[1] : max}
              aria-valuenow={v}
              aria-valuetext={formatValue ? format(v) : undefined}
              aria-orientation='horizontal'
              aria-disabled={disabled || undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? ids.error : undefined}
              aria-label={!isRange && !sliderNameId ? ariaLabel : undefined}
              aria-labelledby={
                isRange ? [sliderNameId, `${ids.thumb}-${index}`].filter(Boolean).join(' ') : sliderNameId
              }
              className={css(classes.thumb, dragging === index && classes.thumbDragging)}
              style={{ left: `${percent(v)}%` }}
              onKeyDown={handleKeyDown(index)}
            >
              {isRange && <VisuallyHidden id={`${ids.thumb}-${index}`}>{names[index]}</VisuallyHidden>}
            </div>
          ))}
        </div>
      </div>

      {showLimits && (
        <div className={classes.limits} aria-hidden='true'>
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      )}

      {name && values.map((v, index) => <input key={index} type='hidden' name={name} value={v} disabled={disabled} />)}

      {error && (
        <FormError id={ids.error} role='alert' style={classes.error}>
          {error}
        </FormError>
      )}
    </div>
  )
}

const thumbSize = 1.25

const createStyles = (theme: Theme, disabled: boolean, invalid: boolean) => {
  const color = disabled
    ? theme.pallete.text.disabled
    : invalid
    ? theme.pallete.status.danger.main
    : theme.pallete.primary.main

  return {
    root: {
      ...theme.typography.variant('main'),
    } as CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '0.25rem',
      lineHeight: '20px',
    } as CSSProperties,
    label: {
      fontWeight: 'bold',
    } as CSSProperties,
    value: {
      marginLeft: 'auto',
      color: theme.pallete.text.secondary,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    } as CSSProperties,
    control: {
      display: 'flex',
      alignItems: 'center',
      height: '1.5rem',
      // Keeps the thumbs inside the box of the slider at the ends of the track
      padding: `0 ${thumbSize / 2}rem`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      touchAction: 'none',
      userSelect: 'none',
    } as CSSProperties,
    track: {
      position: 'relative',
      flex: 1,
      height: '0.25rem',
      borderRadius: '0.125rem',
      background: theme.pallete.divider,
    } as CSSProperties,
    fill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderRadius: 'inherit',
      background: color,
    } as CSSProperties,
    thumb: {
      position: 'absolute',
      top: '50%',
      width: `${thumbSize}rem`,
      height: `${thumbSize}rem`,
      margin: `-${thumbSize / 2}rem 0 0 -${thumbSize / 2}rem`,
      boxSizing: 'border-box',
      borderRadius: '50%',
      border: `2px solid ${color}`,
      background: theme.pallete.surface.main,
      boxShadow: disabled ? 'none' : theme.shadows.outer[10],
      cursor: disabled ? 'not-allowed' : 'grab',
      outline: 'none',
      transition: 'box-shadow .2s',
      '&:focus': {
        zIndex: 1,
        boxShadow: focusBoxShadow(theme, invalid ? 'danger' : 'primary'),
      },
    } as CSSProperties,
    thumbDragging: {
      cursor: 'grabbing',
    } as CSSProperties,
    limits: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '0.25rem',
      color: theme.pallete.text.secondary,
      fontVariantNumeric: 'tabular-nums',
    } as CSSProperties,
    error: {
      marginTop: '0.25rem',
      lineHeight: '20px',
    } as CSSProperties,
  }
}
