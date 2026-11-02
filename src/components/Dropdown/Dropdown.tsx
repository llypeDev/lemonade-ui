import { Options as PopperOptions } from '@popperjs/core'
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { usePopper } from 'react-popper'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useOverlayEscape } from '../../hooks/useOverlayEscape'
import { Theme, useStyles } from '../../styles'
import { composeRefs } from '../../util/react'
import { randomStr } from '../../util/string'
import { DropdownMenu, DropdownMenuProps, menuItemSelector } from './DropdownMenu'

export interface DropdownProps extends DropdownMenuProps {
  /**
   * The anchor element that should receive the dropdown menu.
   */
  anchorRef: HTMLElement | null

  /**
   * Whether the dropdown menu is open or not.
   * When dropdown is opened, it automatically attaches aria attributes to anchor element and focus first menu item.
   */
  open: boolean

  /**
   * If true, the `onClose` callback is called when any menu item is clicked.
   */
  autoclose?: boolean

  /**
   * Popper instance props.
   */
  popperProps?: Partial<PopperOptions>

  children?: React.ReactNode

  /**
   * Called whenever the dropdown wants to close itself.
   *
   * It may be called if:
   * - `Escape` button is pressed
   * - Focus go outside dropdown menu
   * - Clicked anywhere outside anchor and dropdown menu
   * - Any item is clicked and `autoclose` prop is `true`
   */
  onClose?(): void
}

export function Dropdown(props: DropdownProps) {
  const {
    children,
    anchorRef,
    popperProps,
    open,
    onClose,
    autoclose,
    style,
    id,
    innerRef,
    onClick,
    onBlur,
    ...rest
  } = props
  const { classes } = useStyles(createStyles)

  const [menuRef, setMenuRef] = useState<HTMLUListElement>()

  const {
    styles: { popper: popperStyle },
    attributes,
  } = usePopper(anchorRef, menuRef, popperProps)
  const placement = attributes.popper?.['data-popper-placement']

  // Popper moves the menu on every scroll and resize. As a class, each position would add a rule to the stylesheet
  // of the page that is never removed, so the position goes on the element itself.
  useLayoutEffect(() => {
    if (menuRef) {
      Object.assign(menuRef.style, popperStyle)
      return () => Object.keys(popperStyle).forEach((key) => (menuRef.style[key] = ''))
    }
  }, [menuRef, popperStyle])

  const dropdownIdRef = React.useRef<string>(`dropdown-${randomStr()}`)
  const menuId = id ?? dropdownIdRef.current

  // Attaches aria attributes to anchor element
  useEffect(() => {
    if (anchorRef) {
      anchorRef.setAttribute('aria-haspopup', 'true')

      if (open) {
        anchorRef.setAttribute('aria-expanded', 'true')
        anchorRef.setAttribute('aria-controls', menuId)
      } else {
        anchorRef.removeAttribute('aria-expanded')
        anchorRef.removeAttribute('aria-controls')
      }
    }
  }, [open, anchorRef, menuId])

  // Closing removes the menu: when it has the focus, the anchor gets it back instead of the page
  const closeWithFocus = () => {
    if (menuRef && menuRef.contains(menuRef.ownerDocument.activeElement)) {
      anchorRef && anchorRef.focus()
    }
    onClose()
  }

  // Attaches Escape key event, unless a dialog or menu opened over it
  useOverlayEscape(open, closeWithFocus)

  // When opened, focus the first menu item
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (open) {
      setTimeout(() => {
        // Delay focus to preserve window scroll position
        if (menuRef) {
          const firstItem = menuRef.querySelector(menuItemSelector) as HTMLElement

          if (firstItem) {
            firstItem.focus()
          }
        }
      })
    }
  }, [open, menuRef])

  // Pressing the anchor, usually the button that toggles the menu, moves the focus out of the menu. Its click
  // closes the menu, so the blur must not close it first, or the click would open it again.
  const anchorPressed = useRef(false)
  useEffect(() => {
    if (!open || !anchorRef) {
      return
    }

    anchorPressed.current = false
    const handleMouseDown = () => (anchorPressed.current = true)
    anchorRef.addEventListener('mousedown', handleMouseDown)
    return () => anchorRef.removeEventListener('mousedown', handleMouseDown)
  }, [open, anchorRef])

  // Call onClose if target focus is outside menu
  const blurTimeout = useRef<any>()
  useEffect(() => () => clearTimeout(blurTimeout.current), [open])

  const handleBlur = (e: React.FocusEvent<HTMLUListElement>) => {
    onBlur && onBlur(e)
    clearTimeout(blurTimeout.current)
    blurTimeout.current = setTimeout(() => {
      // Not when the menu closed or unmounted meanwhile
      if (menuRef && menuRef.ownerDocument.contains(menuRef)) {
        const currentFocus = menuRef.ownerDocument.activeElement
        const toPressedAnchor = anchorPressed.current && anchorRef && anchorRef.contains(currentFocus)
        anchorPressed.current = false

        if (!menuRef.contains(currentFocus) && !toPressedAnchor) {
          onClose()
        }
      }
    })
  }

  // Call `onClose` when clicked outside dropdown and anchor
  useClickOutside([anchorRef, menuRef], () => {
    if (open) {
      onClose()
    }
  })

  const handleMenuClick = (e: React.MouseEvent<HTMLUListElement>) => {
    onClick && onClick(e)
    if (autoclose) {
      closeWithFocus()
    }
  }

  return (
    open && (
      <DropdownMenu
        {...rest}
        id={menuId}
        innerRef={composeRefs(innerRef, setMenuRef)}
        style={[classes.dropdown, style]}
        data-placement={placement}
        onClick={handleMenuClick}
        onBlur={handleBlur}
      >
        {children}
      </DropdownMenu>
    )
  )
}

Dropdown.defaultProps = {
  autoclose: true,
  onClose: () => null,
} as Partial<DropdownProps>

export const createStyles = (theme: Theme) => ({
  dropdown: {
    zIndex: theme.zIndex.dropdown,
  },
})
