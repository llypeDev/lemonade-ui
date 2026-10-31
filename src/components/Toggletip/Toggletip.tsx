import { Placement } from '@popperjs/core'
import React, { CSSProperties, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, focusBoxShadow, Theme, useStyles } from '../../styles'
import { Icon, IconImage } from '../Icon'
import { Popover } from '../Popover'

export interface ToggletipProps {
  /**
   * The explanation. It can have links and buttons, unlike a `Tooltip`.
   */
  children: React.ReactNode

  /**
   * Name of the button for screen readers, such as "About the plans"
   * @default "More information", from the locale strings
   */
  label?: string

  /**
   * @default 'infoCircleOutline'
   */
  icon?: IconImage

  /**
   * Side of the button where the explanation shows
   * @default 'top'
   */
  placement?: Placement

  /**
   * Styles of the explanation
   */
  style?: ExternalStyles
}

/**
 * A small button, usually beside a label, that shows an explanation when clicked, such as what a field means.
 * Use it instead of a `Tooltip` when the explanation has links, or when it must work on touch screens.
 */
export function Toggletip(props: ToggletipProps) {
  const { children, label, icon = 'infoCircleOutline', placement = 'top', style } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [anchor, setAnchor] = useState<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const name = label ?? locale.toggletip.label

  return (
    <>
      <button ref={setAnchor} type='button' className={classes.button} aria-label={name} onClick={() => setOpen(!open)}>
        <Icon icon={icon} size={1.25} />
      </button>
      <Popover
        anchorRef={anchor}
        open={open}
        onClose={() => setOpen(false)}
        placement={placement}
        aria-label={name}
        style={css(classes.popover, style)}
      >
        {children}
      </Popover>
    </>
  )
}

const createStyles = (theme: Theme) => ({
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    width: '1.5rem',
    height: '1.5rem',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: '50%',
    background: 'transparent',
    color: theme.pallete.text.secondary,
    cursor: 'pointer',
    outline: 'none',
    transition: 'color .2s, background .2s',
    '&:hover, &[aria-expanded="true"]': {
      color: theme.pallete.primary.main,
      background: theme.pallete.surface.background,
    },
    '&:focus': {
      boxShadow: focusBoxShadow(theme),
    },
  } as CSSProperties,
  popover: {
    maxWidth: 'min(18rem, calc(100vw - 2rem))',
    padding: '0.75rem 1rem',
  } as CSSProperties,
})
