import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { debounce } from '../../util'

export type AsyncComboboxLoadFn<T> = (filter: string) => Promise<T[]> | T[]

export function useComboboxItemsLoader<T>(items: AsyncComboboxLoadFn<T>, debounceMs = 350) {
  const [loading, setLoading] = useState(false)
  const [currItems, setCurrItems] = useState<T[]>([])
  const isMounted = useIsMounted()

  // Only the latest request updates the list, so a slow answer for an older filter cannot replace the answer for
  // the current one
  const lastRequest = useRef(0)

  // The loader is read when a load runs, so a new function on each render, such as one built from an inline
  // itemToString, keeps the same debounce instead of starting a new one
  const itemsRef = useRef(items)
  itemsRef.current = items

  const load = useCallback(
    (filter: string) => {
      const request = ++lastRequest.current
      const isCurrent = () => isMounted.current && request === lastRequest.current

      setLoading(true)
      // The loader runs inside the promise, so an error it throws ends the load as a rejection does: the list empties
      // and the loading ends
      Promise.resolve()
        .then(() => itemsRef.current(filter ?? ''))
        .then((result) => isCurrent() && setCurrItems(result))
        .catch(() => isCurrent() && setCurrItems([]))
        .finally(() => isCurrent() && setLoading(false))
    },
    [isMounted]
  )

  const debouncedLoad = useMemo(() => debounce(load, debounceMs), [load, debounceMs])

  // A load waiting for the debounce is dropped when the component unmounts
  useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad])

  const loadItems = useCallback((filter: string) => debouncedLoad(filter), [debouncedLoad])

  return {
    items: currItems,
    loading,
    loadItems,
  }
}

const NOT_LOADED = {}

/**
 * Loads the list when the menu opens and again when the items change while it is open, with the current filter.
 * The list is kept while the items stay the same, and a new array holding the same items, such as one written inline,
 * is not a change: a parent that renders often would otherwise restart the debounce on each render.
 *
 * @param reloadOnOpen Whether each opening loads the list again, for a menu whose filter starts empty on each opening.
 */
export function useLoadItemsWhenOpen(
  isOpen: boolean,
  items: unknown,
  loadItems: (filter: string) => void,
  getFilter: () => string,
  reloadOnOpen = false
) {
  const loadedFrom = useRef<unknown>(NOT_LOADED)
  const getFilterRef = useRef(getFilter)
  getFilterRef.current = getFilter

  useEffect(() => {
    if (!isOpen) {
      if (reloadOnOpen) {
        loadedFrom.current = NOT_LOADED
      }
    } else if (!hasSameItems(loadedFrom.current, items)) {
      loadedFrom.current = items
      loadItems(getFilterRef.current() ?? '')
    }
  }, [isOpen, items, loadItems, reloadOnOpen])
}

function hasSameItems(a: unknown, b: unknown) {
  return (
    a === b ||
    (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, index) => item === b[index]))
  )
}
