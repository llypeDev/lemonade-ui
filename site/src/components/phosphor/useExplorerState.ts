import { useCallback, useEffect, useState } from 'react'

import { CATEGORIES, ICONS_BY_NAME, isHexColor, PhosphorWeight, WEIGHTS } from './data'

export const DEFAULT_SIZE = 32
export const MIN_SIZE = 16
export const MAX_SIZE = 96

export interface ExplorerSettings {
  query: string
  weight: PhosphorWeight
  size: number
  /** hex color, or an empty string to follow the current text color (light/dark theme aware) */
  color: string
  category: string
  /** kebab-case name of the selected icon */
  selected: string
}

export const DEFAULT_SETTINGS: ExplorerSettings = {
  query: '',
  weight: 'regular',
  size: DEFAULT_SIZE,
  color: '',
  category: '',
  selected: '',
}

const STORAGE_KEY = 'lemonade:phosphor-explorer'
const PERSISTED: Array<keyof ExplorerSettings> = ['weight', 'size', 'color']

const clampSize = (value: number) =>
  Number.isFinite(value) ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(value))) : DEFAULT_SIZE

/** Validates untrusted values coming from the URL or localStorage. */
function sanitize(raw: Partial<Record<keyof ExplorerSettings, unknown>>): Partial<ExplorerSettings> {
  const result: Partial<ExplorerSettings> = {}
  if (typeof raw.query === 'string') result.query = raw.query.slice(0, 100)
  if (typeof raw.weight === 'string' && WEIGHTS.includes(raw.weight as PhosphorWeight)) {
    result.weight = raw.weight as PhosphorWeight
  }
  if (raw.size !== undefined && raw.size !== null && raw.size !== '') result.size = clampSize(Number(raw.size))
  if (typeof raw.color === 'string') {
    const color = raw.color.startsWith('#') ? raw.color : `#${raw.color}`
    result.color = raw.color === '' ? '' : isHexColor(color) ? color.toLowerCase() : undefined
  }
  if (typeof raw.category === 'string' && CATEGORIES.some((category) => category.name === raw.category)) {
    result.category = raw.category
  }
  if (typeof raw.selected === 'string' && ICONS_BY_NAME[raw.selected]) result.selected = raw.selected
  Object.keys(result).forEach((key) => result[key] === undefined && delete result[key])
  return result
}

const URL_KEYS: Record<keyof ExplorerSettings, string> = {
  query: 'q',
  weight: 'weight',
  size: 'size',
  color: 'color',
  category: 'category',
  selected: 'icon',
}

function readUrl(): Partial<ExplorerSettings> {
  const params = new URLSearchParams(window.location.search)
  const raw: Partial<Record<keyof ExplorerSettings, unknown>> = {}
  ;(Object.keys(URL_KEYS) as Array<keyof ExplorerSettings>).forEach((key) => {
    const value = params.get(URL_KEYS[key])
    if (value !== null) raw[key] = value
  })
  return sanitize(raw)
}

function readStorage(): Partial<ExplorerSettings> {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    const raw: Partial<Record<keyof ExplorerSettings, unknown>> = {}
    PERSISTED.forEach((key) => (raw[key] = stored[key]))
    return sanitize(raw)
  } catch {
    return {}
  }
}

export function settingsToSearch(settings: ExplorerSettings): string {
  const params = new URLSearchParams()
  ;(Object.keys(URL_KEYS) as Array<keyof ExplorerSettings>).forEach((key) => {
    const value = settings[key]
    if (value !== DEFAULT_SETTINGS[key] && value !== '') {
      params.set(URL_KEYS[key], key === 'color' ? String(value).replace('#', '') : String(value))
    }
  })
  const search = params.toString()
  return search ? `?${search}` : ''
}

/**
 * Explorer settings shared through the URL (deep links) and localStorage (weight, size and color are remembered).
 * The state is only read after mount, so server-side rendering stays deterministic.
 */
export function useExplorerState() {
  const [settings, setSettings] = useState<ExplorerSettings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSettings({ ...DEFAULT_SETTINGS, ...readStorage(), ...readUrl() })
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const url = `${window.location.pathname}${settingsToSearch(settings)}${window.location.hash}`
    window.history.replaceState(window.history.state, '', url)
    try {
      const persisted = PERSISTED.reduce((all, key) => ({ ...all, [key]: settings[key] }), {})
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch {
      // storage can be unavailable (private mode); deep links keep working
    }
  }, [ready, settings])

  const update = useCallback((patch: Partial<ExplorerSettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const reset = useCallback(() => {
    setSettings((current) => ({ ...DEFAULT_SETTINGS, query: current.query, category: current.category }))
  }, [])

  const randomize = useCallback(() => {
    setSettings((current) => {
      const otherWeights = WEIGHTS.filter((weight) => weight !== current.weight)
      const hue = Math.floor(Math.random() * 360)
      return {
        ...current,
        weight: otherWeights[Math.floor(Math.random() * otherWeights.length)],
        size: MIN_SIZE + Math.floor(Math.random() * ((MAX_SIZE - MIN_SIZE) / 4 + 1)) * 4,
        color: hslToHex(hue, 70, 40),
      }
    })
  }, [])

  return { settings, ready, update, reset, randomize }
}

function hslToHex(h: number, s: number, l: number) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const value = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}
