import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useIsMounted } from '../../hooks/useIsMounted'
import { debounce } from '../../util'

/**
 * Function that is used to populate the select menu.
 *
 * @param filter The current select input filter.
 * @return A promise of the items to be populated.
 */
export type AsyncSelectLoadFn<T> = (filter: string) => Promise<T[]>

export function useAsyncSelect<T>(loadItems: AsyncSelectLoadFn<T>, debounceMs = 350) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<T[]>([])
  const isMounted = useIsMounted()

  // Only the latest request updates the list, so a slow answer for an older filter cannot replace the answer for
  // the current one
  const lastRequest = useRef(0)

  const load = useCallback(
    (filter: string) => {
      const request = ++lastRequest.current
      const isCurrent = () => isMounted.current && request === lastRequest.current

      setLoading(true)
      loadItems(filter)
        .then((loadedItems) => isCurrent() && setItems(loadedItems))
        .finally(() => isCurrent() && setLoading(false))
    },
    [loadItems, isMounted]
  )

  const debouncedLoad = useMemo(() => debounce(load, debounceMs), [debounceMs, load])

  // A load waiting for the debounce is dropped when the component unmounts
  useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad])

  const handleFilterChange = (filter: string) => {
    setLoading(true)
    return debouncedLoad(filter)
  }

  return {
    getSelectProps: () => ({
      items,
      loading,
      onFilterChange: handleFilterChange,
    }),
  }
}
