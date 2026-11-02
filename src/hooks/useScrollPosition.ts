import { useEffect, useLayoutEffect, useState } from 'react'

// Runs before the browser paints, and only as an effect on the server, where layout effects warn
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function getPosition() {
  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }
}

export function useScrollPosition() {
  // The server has no window, and the first render in the browser must match what it rendered
  const [position, setPosition] = useState(() => ({ scrollX: 0, scrollY: 0 }))

  useIsomorphicLayoutEffect(() => {
    function handleScroll() {
      const next = getPosition()
      setPosition((current) => (current.scrollX === next.scrollX && current.scrollY === next.scrollY ? current : next))
    }

    handleScroll()
    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return position
}
