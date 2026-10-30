import React, { CSSProperties } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, hexToRGB, Theme, useStyles } from '../../styles'
import { Omit } from '../../util'
import { ProgressCircle } from '../ProgressCircle'
import { Text } from '../Text'
import { VisuallyHidden } from '../VisuallyHidden'

export interface LoadingOverlayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /**
   * Covers the content while true
   */
  loading: boolean

  /**
   * Text below the spinner, also announced by screen readers
   * @default "Loading", from the locale strings, announced but not shown
   */
  label?: React.ReactNode

  /**
   * The content that loads, such as a table or a form
   */
  children?: React.ReactNode

  style?: ExternalStyles
}

/**
 * Covers part of the page while it loads, such as a table after a new search, keeping its layout and stopping
 * clicks and the keyboard until the content is ready.
 */
export function LoadingOverlay(props: LoadingOverlayProps) {
  const { loading, label, children, style, ...rest } = props
  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)

  return (
    <div className={css(classes.root, style)} aria-busy={loading} {...rest}>
      {/* While loading, the content leaves the tab order and the accessibility tree */}
      <div className={classes.content} {...(loading ? { inert: '' } : {})}>
        {children}
      </div>
      {loading && (
        <div className={classes.overlay}>
          <ProgressCircle aria-hidden='true' />
          {label && <Text style={classes.label}>{label}</Text>}
        </div>
      )}
      <VisuallyHidden role='status'>{loading ? label ?? locale.progressCircle.loading : ''}</VisuallyHidden>
    </div>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    position: 'relative',
    minWidth: 0,
  } as CSSProperties,
  content: {
    minWidth: 0,
  } as CSSProperties,
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    // Opaque enough for the label to read well over the content
    background: hexToRGB(theme.pallete.surface.main, 0.85),
    borderRadius: 'inherit',
    cursor: 'progress',
  } as CSSProperties,
  label: {
    fontWeight: 'bold',
  } as CSSProperties,
})
