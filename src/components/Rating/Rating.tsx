import React, { CSSProperties, useMemo, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { yellow } from '../../styles/colors'
import { Omit } from '../../util'
import * as numberUtil from '../../util/number'
import { randomStr } from '../../util/string'
import { Icon } from '../Icon'
import { VisuallyHidden, visuallyHiddenStyle } from '../VisuallyHidden'

export type RatingSize = 'small' | 'medium' | 'large'

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'onChange' | 'defaultValue'> {
  /**
   * Current rating, for a controlled rating. In a read-only rating, it can have decimals, such as 4.5.
   */
  value?: number

  /**
   * Starting rating of an uncontrolled rating
   * @default 0
   */
  defaultValue?: number

  /**
   * Called when the user picks a rating
   */
  onChange?(value: number): void

  /**
   * Number of stars
   * @default 5
   */
  max?: number

  /**
   * Shows the rating without letting the user change it, such as the average of the reviews of a product
   * @default false
   */
  readOnly?: boolean

  /**
   * Lets the user remove the rating by picking the same star again
   * @default false
   */
  allowClear?: boolean

  /**
   * Name of the radio inputs, to send the rating with a form
   */
  name?: string

  disabled?: boolean

  /**
   * @default 'medium'
   */
  size?: RatingSize

  style?: ExternalStyles
}

const iconSizes: Record<RatingSize, number> = { small: 1, medium: 1.5, large: 2 }

/**
 * Stars that show or take a rating, such as the reviews of a product or a satisfaction survey.
 */
export function Rating(props: RatingProps) {
  const {
    value,
    defaultValue = 0,
    onChange,
    max = 5,
    readOnly = false,
    allowClear = false,
    name,
    disabled = false,
    size = 'medium',
    style,
    ...rest
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles, size)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [hovered, setHovered] = useState<number | null>(null)
  const groupName = useMemo(() => name ?? `rating-${randomStr()}`, [name])

  const current = value ?? internalValue
  const stars = Array.from({ length: max }, (_, index) => index + 1)
  const starsLabel = (count: number) => `${count} ${count === 1 ? locale.rating.star : locale.rating.stars}`

  if (readOnly) {
    const label = `${numberUtil.format(current, { maximumFractionDigits: 1 })} ${locale.rating.of} ${starsLabel(max)}`

    return (
      <div role='img' aria-label={label} className={css(classes.root, style)} {...rest}>
        {stars.map((star) => {
          // Share of this star that is filled, such as 0.5 for the last star of 4.5
          const fill = Math.max(0, Math.min(1, current - star + 1))
          return (
            <span key={star} className={classes.star}>
              <Icon icon='starOutline' size={iconSizes[size]} style={classes.empty} />
              {fill > 0 && (
                <span className={classes.fill} style={{ width: `${fill * 100}%` }}>
                  <Icon icon='starFilled' size={iconSizes[size]} style={classes.filled} />
                </span>
              )}
            </span>
          )
        })}
      </div>
    )
  }

  const select = (star: number) => {
    const next = allowClear && star === current ? 0 : star
    if (value === undefined) {
      setInternalValue(next)
    }
    onChange && onChange(next)
  }

  const shown = hovered ?? current

  return (
    <div
      role='radiogroup'
      className={css(classes.root, disabled && classes.disabled, style)}
      onMouseLeave={() => setHovered(null)}
      {...rest}
    >
      {stars.map((star) => (
        <label
          key={star}
          className={css(classes.star, classes.option)}
          onMouseEnter={() => !disabled && setHovered(star)}
        >
          <input
            type='radio'
            name={groupName}
            value={star}
            checked={current === star}
            disabled={disabled}
            className={classes.input}
            onChange={() => select(star)}
            // A click on the checked star does not change the input, so it clears the rating here
            onClick={() => allowClear && star === current && select(star)}
          />
          <Icon
            icon={star <= shown ? 'starFilled' : 'starOutline'}
            size={iconSizes[size]}
            style={star <= shown ? classes.filled : classes.empty}
            aria-hidden='true'
          />
          <VisuallyHidden>{starsLabel(star)}</VisuallyHidden>
        </label>
      ))}
    </div>
  )
}

const createStyles = (theme: Theme, size: RatingSize) => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: size === 'small' ? '0.125rem' : '0.25rem',
    verticalAlign: 'middle',
  } as CSSProperties,
  star: {
    position: 'relative',
    display: 'inline-flex',
    borderRadius: theme.radius.button,
  } as CSSProperties,
  option: {
    cursor: 'pointer',
    // The input is hidden, so the star shows its focus
    '&:focus-within': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  input: visuallyHiddenStyle,
  empty: {
    color: theme.pallete.text.secondary,
  } as CSSProperties,
  filled: {
    // Dark enough to keep a 3:1 contrast with light and dark surfaces
    color: yellow.c60,
  } as CSSProperties,
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
    display: 'inline-flex',
    // The star keeps its size and the box cuts it, instead of shrinking it
    '& svg': {
      flexShrink: 0,
    },
  } as CSSProperties,
  disabled: {
    opacity: 0.5,
    '& label': {
      cursor: 'not-allowed',
    },
  } as CSSProperties,
})
