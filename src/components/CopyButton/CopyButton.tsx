import React, { CSSProperties, useEffect, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { useLocale } from '../../i18n'
import { useStyles } from '../../styles'
import { Omit } from '../../util'
import { Button, ButtonProps } from '../Button'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'
import { VisuallyHidden } from '../VisuallyHidden'

import { copyToClipboard } from './copyToClipboard'

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'onCopy' | 'onError'> {
  /**
   * Text copied to the clipboard, or a function that returns it when the button is clicked
   */
  text: string | (() => string)

  /**
   * Label of the button. Without it, the button shows only the icon, with "Copy" (from the locale strings)
   * as its name and tooltip.
   */
  children?: React.ReactNode

  /**
   * Label shown for a moment after copying
   * @default "Copied", from the locale strings
   */
  copiedLabel?: string

  /**
   * How long the button shows that the text was copied, in milliseconds
   * @default 2000
   */
  timeout?: number

  /**
   * Called after the text is copied
   */
  onCopy?(text: string): void

  /**
   * Called when the browser does not let the page write to the clipboard
   */
  onError?(error: unknown): void
}

type CopyStatus = 'idle' | 'copied' | 'failed'

/**
 * Button that copies a text to the clipboard, such as a code, a link or a key, and confirms it with a check
 * icon and a message for screen readers.
 */
export function CopyButton(props: CopyButtonProps) {
  const { text, children, copiedLabel, timeout = 2000, onCopy, onError, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [status, setStatus] = useState<CopyStatus>('idle')
  const isMounted = useIsMounted()

  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => setStatus('idle'), timeout)
      return () => clearTimeout(timer)
    }
  }, [status, timeout])

  const handleClick = () => {
    const value = typeof text === 'function' ? text() : text

    copyToClipboard(value).then(
      () => {
        isMounted.current && setStatus('copied')
        onCopy && onCopy(value)
      },
      (error) => {
        isMounted.current && setStatus('failed')
        onError && onError(error)
      }
    )
  }

  const copied = status === 'copied'
  const copiedText = copiedLabel ?? locale.copyButton.copied
  const iconOnly = children === undefined || children === null
  const message = copied ? copiedText : status === 'failed' ? locale.copyButton.failed : ''

  const button = (
    <Button aria-label={iconOnly ? locale.copyButton.copy : undefined} onClick={handleClick} {...rest}>
      <Icon
        icon={copied ? 'checkDefault' : 'copyOutline'}
        // The check is green on buttons with a neutral background
        fill={copied && (!rest.kind || rest.kind === 'normal') ? 'success' : undefined}
        style={!iconOnly && { marginRight: '0.5rem' }}
        aria-hidden='true'
      />
      {!iconOnly && (
        // Both labels take the same cell, so the button keeps its width when the label changes
        <span className={classes.labels}>
          <span className={css(classes.label, copied && classes.hidden)}>{children}</span>
          <span className={css(classes.label, !copied && classes.hidden)}>{copiedText}</span>
        </span>
      )}
    </Button>
  )

  return (
    <>
      {iconOnly ? <Tooltip text={copied ? copiedText : locale.copyButton.copy}>{button}</Tooltip> : button}
      <VisuallyHidden role='status'>{message}</VisuallyHidden>
    </>
  )
}

const createStyles = () => ({
  labels: {
    display: 'inline-grid',
  } as CSSProperties,
  label: {
    gridArea: '1 / 1',
  } as CSSProperties,
  hidden: {
    // Also leaves the label out of the name of the button
    visibility: 'hidden',
  } as CSSProperties,
})
