import React, { MouseEvent, useState } from 'react'

import { useIsMounted } from '../../../hooks/useIsMounted'
import { useLocale } from '../../../i18n'
import { ExternalStyles, useStyles } from '../../../styles'
import { Omit } from '../../../util'
import { VisuallyHidden } from '../../VisuallyHidden'
import { ButtonBase, ButtonBaseProps } from '../ButtonBase'

import { createBaseStyles, createSizeStyles, skinMap, SkinProps } from './ButtonSkins'

export interface ButtonProps extends SkinProps, Omit<ButtonBaseProps, 'style'> {
  /**
   * Shows a spinner in place of the label, which keeps its width, and ignores clicks. The button keeps the focus,
   * and screen readers hear that it is busy and unavailable, and "Loading", from the locale strings. A promise
   * returned by `onClick` does the same until it settles.
   */
  loading?: boolean
  block?: boolean
  style?: ExternalStyles
}

export function Button(props: ButtonProps) {
  const {
    loading,
    block,
    style,
    skin,
    size,
    kind,
    onClick,
    onLoadingChange: externalOnLoadingChange,
    children,
    ...rest
  } = props

  const isMounted = useIsMounted()
  const locale = useLocale()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const onLoadingChange = (value: boolean) => {
    if (isMounted.current) {
      setIsLoading(value)
    }
    externalOnLoadingChange && externalOnLoadingChange(value)
  }
  const isReallyLoading = isLoading || loading

  const { theme, css } = useStyles()
  const skinStyles = skinMap[skin](theme)
  const sizeStyles = createSizeStyles(theme)
  const baseStyles = createBaseStyles(theme)

  const classes = css(
    baseStyles.button,
    skinStyles.button,
    kind === 'primary' && skinStyles.primary,
    kind === 'danger' && skinStyles.danger,
    size === 'large' && sizeStyles.large,
    size === 'medium' && sizeStyles.medium,
    size === 'small' && sizeStyles.small,
    isReallyLoading && baseStyles.loading,
    props.disabled && baseStyles.disabled,
    block && baseStyles.block,
    style
  )

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!isReallyLoading) {
      return onClick && onClick(e)
    }
  }

  return (
    <ButtonBase
      className={classes}
      onLoadingChange={onLoadingChange}
      data-loading={isLoading ? true : undefined}
      onClick={handleClick}
      {...rest}
      // Not the native `disabled`, which would take the focus away from the button
      aria-busy={isReallyLoading ? true : rest['aria-busy']}
      aria-disabled={isReallyLoading ? true : rest['aria-disabled']}
    >
      <span>{children}</span>
      {isReallyLoading && <VisuallyHidden>{locale.button.loading}</VisuallyHidden>}
    </ButtonBase>
  )
}

Button.defaultProps = {
  kind: 'normal',
  skin: 'default',
  size: 'medium',
} as Partial<ButtonProps>
