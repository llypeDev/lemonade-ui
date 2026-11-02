import { useEffect } from 'react'

// How many open overlays use each class, so the first one to close does not give the page its scroll back
const locks = new Map<string, number>()

/**
 * Adds `className`, which removes the scroll of the page, to the body while `active` is true. Overlays that are
 * open at the same time share the class: it leaves the body when the last of them closes.
 */
export function useBodyScrollLock(active: boolean, className: string) {
  useEffect(() => {
    if (!active) {
      return
    }

    const count = locks.get(className) ?? 0
    locks.set(className, count + 1)
    if (count === 0) {
      document.body.classList.add(className)
    }

    return () => {
      const left = locks.get(className) - 1
      locks.set(className, left)
      if (left === 0) {
        document.body.classList.remove(className)
      }
    }
  }, [active, className])
}
