import { Placement } from '@popperjs/core'
import React, { CSSProperties, useState } from 'react'

import { useLocale } from '../../i18n'
import { ExternalStyles, Theme, useStyles } from '../../styles'
import { Button } from '../Button'
import { ButtonKind, ButtonSize, ButtonSkin } from '../Button/Button/ButtonSkins'
import { ButtonGroup } from '../ButtonGroup'
import { Dropdown } from '../Dropdown'
import { Icon } from '../Icon'

export interface SplitButtonProps {
  /**
   * Text of the main action, such as "Save"
   */
  children: React.ReactNode

  /**
   * Runs the main action
   */
  onClick?(e: React.MouseEvent<HTMLButtonElement>): void | Promise<unknown>

  /**
   * Related actions, such as `DropdownItem`s for "Save as draft" and "Save and close"
   */
  menu: React.ReactNode

  /**
   * Name of the button that opens the menu, for screen readers, such as "More ways to save"
   * @default "More options", from the locale strings
   */
  menuLabel?: string

  /**
   * Where the menu opens
   * @default 'bottom-end'
   */
  menuPlacement?: Placement

  kind?: ButtonKind
  skin?: ButtonSkin
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  style?: ExternalStyles
}

/**
 * A main action with a button beside it that opens related actions, such as "Save" with "Save as draft".
 * Use it when one action is the most common and the others are variations of it.
 */
export function SplitButton(props: SplitButtonProps) {
  const {
    children,
    onClick,
    menu,
    menuLabel,
    menuPlacement = 'bottom-end',
    kind,
    skin,
    size,
    disabled,
    loading,
    style,
  } = props

  const locale = useLocale()
  const { classes, css } = useStyles(createStyles)
  const [anchor, setAnchor] = useState<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const label = menuLabel ?? locale.splitButton.more

  return (
    <ButtonGroup style={css(classes.root, style)}>
      <Button kind={kind} skin={skin} size={size} disabled={disabled} loading={loading} onClick={onClick}>
        {children}
      </Button>
      <Button
        innerRef={setAnchor}
        kind={kind}
        skin={skin}
        size={size}
        disabled={disabled || loading}
        aria-label={label}
        title={label}
        style={css(classes.toggle, size === 'small' && classes.toggleSmall)}
        onClick={() => setOpen(!open)}
      >
        <Icon icon='angleDown' style={css(classes.chevron, open && classes.open)} />
      </Button>
      <Dropdown
        anchorRef={anchor}
        open={open}
        onClose={() => setOpen(false)}
        popperProps={{ placement: menuPlacement }}
      >
        {menu}
      </Dropdown>
    </ButtonGroup>
  )
}

const createStyles = (theme: Theme) => ({
  root: {
    display: 'inline-flex',
    // A thin line between the two buttons, also on filled ones
    '& > button + button': {
      marginLeft: 1,
    },
  } as CSSProperties,
  toggle: {
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  } as CSSProperties,
  toggleSmall: {
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
  } as CSSProperties,
  chevron: {
    transition: 'transform .2s',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  } as CSSProperties,
  open: {
    transform: 'rotate(180deg)',
  } as CSSProperties,
})
