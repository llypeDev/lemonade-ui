import { useEffect, useLayoutEffect, useState } from 'react'

// Runs before the browser paints, and only as an effect on the server, where layout effects warn
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export interface WindowSize {
  innerHeight: number
  innerWidth: number
  outerHeight: number
  outerWidth: number
}

function getSize(w: Window): WindowSize {
  return {
    innerHeight: w.innerHeight,
    innerWidth: w.innerWidth,
    outerHeight: w.outerHeight,
    outerWidth: w.outerWidth,
  }
}

/**
 * Hook that returns current window dimensions.
 *
 * Note: it returns null on first render, as on the server, where the `window` object is not defined, so the page
 * that the server rendered matches the first render in the browser. The size comes right after, before the browser
 * paints.
 */
export function useWindowSize(): WindowSize | null {
  const [windowSize, setWindowSize] = useState<WindowSize | null>(null)

  useIsomorphicLayoutEffect(() => {
    setWindowSize(getSize(window))

    function handleResize() {
      setWindowSize(getSize(window))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}
