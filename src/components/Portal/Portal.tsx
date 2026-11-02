import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  container?: Element
  children: React.ReactNode
}

// The server renders no portal. While React hydrates a page that the server rendered, which React 16 marks with
// data-reactroot, a portal renders nothing on its first render too, so the page matches, and its content right
// after. Effects run once the hydration is over, so from the first one on, portals render their content at once,
// and the components that open them, such as Drawer, reach that content in their own first effects.
let hydrated = false

const isHydrating = () => !hydrated && !!document.querySelector('[data-reactroot]')

export function Portal(props: PortalProps) {
  const { children, container } = props

  const [mounted, setMounted] = useState(() => typeof document !== 'undefined' && !isHydrating())
  useEffect(() => {
    hydrated = true
    setMounted(true)
  }, [])

  return mounted ? createPortal(children, container || document.body) : null
}
