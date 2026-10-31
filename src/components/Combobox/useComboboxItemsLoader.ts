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
      Promise.resolve(itemsRef.current(filter))
        .then((result) => isCurrent() && setCurrItems(result))
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
