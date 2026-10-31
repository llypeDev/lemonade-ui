import { useEffect, useRef } from 'react'

export interface UseHotkeysOptions {
  /**
   * Turns the shortcut off, such as while a modal is open
   * @default true
   */
  enabled?: boolean

  /**
   * Also runs while the focus is in a text field, a select or an editable element. Leave it off for shortcuts made
   * of a single character, which the user types in fields.
   * @default false
   */
  enableOnFormFields?: boolean

  /**
   * Stops the default action of the browser for the keys, such as `ctrl+s` saving the page
   * @default true
   */
  preventDefault?: boolean

  /**
   * Element that listens to the keys, for shortcuts that only work inside part of the page
   * @default document
   */
  target?: React.RefObject<HTMLElement>
}

const aliases: Record<string, string> = {
  esc: 'escape',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  del: 'delete',
  return: 'enter',
  plus: '+',
}

interface Hotkey {
  key: string
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
}

export const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform)

/**
 * Turns a shortcut such as `mod+shift+k` into the key and the modifiers it needs. `mod` is `meta` (⌘) on Apple
 * devices and `ctrl` elsewhere.
 */
export const parseHotkey = (hotkey: string): Hotkey => {
  // `+` as the key itself, such as in `ctrl++`, is kept when splitting
  const parts = hotkey
    .toLowerCase()
    .replace(/\s/g, '')
    .split(/\+(?!$)/)

  const modifiers = parts.slice(0, -1)
  const last = parts[parts.length - 1]
  const mod = isMac() ? 'meta' : 'ctrl'
  const has = (name: string) => modifiers.includes(name) || (modifiers.includes('mod') && mod === name)

  return {
    key: aliases[last] ?? last,
    ctrl: has('ctrl') || has('control'),
    alt: has('alt') || has('option'),
    shift: has('shift'),
    meta: has('meta') || has('cmd') || has('command'),
  }
}

export const matchesHotkey = (event: KeyboardEvent, hotkey: Hotkey) => {
  const key = (event.key || '').toLowerCase()
  if (key !== hotkey.key) {
    return false
  }

  // The shift key is part of characters such as `?`, so it only counts for letters, digits and named keys
  const shiftIsPartOfKey = hotkey.key.length === 1 && !/[a-z0-9]/.test(hotkey.key)

  return (
    event.ctrlKey === hotkey.ctrl &&
    event.altKey === hotkey.alt &&
    event.metaKey === hotkey.meta &&
    (shiftIsPartOfKey || event.shiftKey === hotkey.shift)
  )
}

const isFormField = (element: EventTarget | null) => {
  if (!(element instanceof HTMLElement)) {
    return false
  }
  const tag = element.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') {
    return true
  }
  if (tag === 'INPUT') {
    const type = (element.getAttribute('type') || 'text').toLowerCase()
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(type)
  }
  return element.isContentEditable || element.getAttribute('contenteditable') === 'true'
}

/**
 * Runs a function when the user presses a keyboard shortcut, such as `mod+k` to open a search or `?` to show the
 * shortcuts. Takes one shortcut or a list of them. Modifiers are `ctrl`, `alt`, `shift`, `meta` and `mod`, which is
 * ⌘ on Apple devices and Ctrl elsewhere.
 *
 * Shortcuts should not replace a visible way to do the same thing, and should be listed somewhere the user can
 * find them, such as with the `Kbd` component.
 *
 * @example
 * useHotkeys('mod+k', () => setSearchOpen(true))
 */
export function useHotkeys(
  keys: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: UseHotkeysOptions = {}
) {
  const { enabled = true, enableOnFormFields = false, preventDefault = true, target } = options

  // The latest handler runs without listening again on every render
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const keyList = (Array.isArray(keys) ? keys : [keys]).join('\n')

  useEffect(() => {
    if (!enabled) {
      return
    }

    const element: HTMLElement | Document = target ? target.current : document
    if (!element) {
      return
    }

    const hotkeys = keyList.split('\n').filter(Boolean).map(parseHotkey)

    const handleKeyDown = (e: Event) => {
      const event = e as KeyboardEvent
      if (event.defaultPrevented || event.isComposing) {
        return
      }
      if (!enableOnFormFields && isFormField(event.target)) {
        return
      }
      if (hotkeys.some((hotkey) => matchesHotkey(event, hotkey))) {
        preventDefault && event.preventDefault()
        handlerRef.current(event)
      }
    }

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [keyList, enabled, enableOnFormFields, preventDefault, target])
}
