import { useCallback, useEffect, useRef, useState } from 'react'

const getStorage = (): Storage | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    // Browsers that block site data throw when the storage is read
    return null
  }
}

const read = <T>(key: string, initialValue: T): T => {
  try {
    const storage = getStorage()
    const stored = storage && storage.getItem(key)
    return stored === null || stored === undefined ? initialValue : JSON.parse(stored)
  } catch {
    return initialValue
  }
}

export type UseLocalStorageResult<T> = [T, (value: T | ((previous: T) => T)) => void, () => void]

/**
 * Keeps a value in the `localStorage` of the browser, such as a preference of the user, so it survives reloads.
 * The value is saved as JSON and follows changes made by other tabs. When the storage is blocked or full, the
 * value still works for the current page.
 *
 * Returns the value, a function to change it and a function to remove it, which brings back `initialValue`.
 *
 * @example
 * const [density, setDensity] = useLocalStorage('table-density', 'comfortable')
 */
export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageResult<T> {
  const initialRef = useRef(initialValue)
  initialRef.current = initialValue

  const [value, setStateValue] = useState<T>(() => read(key, initialValue))
  const valueRef = useRef(value)
  valueRef.current = value

  // A different key reads its own value
  const keyRef = useRef(key)
  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key
      setStateValue(read(key, initialRef.current))
    }
  }, [key])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        setStateValue(read(key, initialRef.current))
      } else if (e.key === null) {
        // Another tab cleared the whole storage
        setStateValue(initialRef.current)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved = next instanceof Function ? next(valueRef.current) : next
      valueRef.current = resolved
      setStateValue(resolved)
      try {
        const storage = getStorage()
        storage && storage.setItem(key, JSON.stringify(resolved))
      } catch {
        // The storage is full or blocked: the value stays only in the page
      }
    },
    [key]
  )

  const remove = useCallback(() => {
    valueRef.current = initialRef.current
    setStateValue(initialRef.current)
    try {
      const storage = getStorage()
      storage && storage.removeItem(key)
    } catch {
      // Nothing to remove when the storage is blocked
    }
  }, [key])

  return [value, setValue, remove]
}
