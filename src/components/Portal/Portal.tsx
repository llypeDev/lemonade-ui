import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  container?: Element
  children: React.ReactNode
}

// The server renders no portal. While React hydrates a page that the server rendered, a portal renders nothing on
// its first render too, so the page matches, and its content right after. Otherwise it renders its content at
// once, so the components that open one, such as Drawer, reach that content in their own first effects.
//
// React 16 and 17 mark the root element of a page rendered on the server with data-reactroot, and link that
// element to React last, once all of its descendants are rendered, so the page is hydrating while it is not linked.
let hydrated = false

const isLinkedToReact = (element: Element) =>
  Object.keys(element).some((key) => key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$'))

const isHydrating = () => {
  if (hydrated) {
    return false
  }

  const root = document.querySelector('[data-reactroot]')
  if (root && isLinkedToReact(root)) {
    hydrated = true
  }
  return !!root && !hydrated
}

export function Portal(props: PortalProps) {
  const { children, container } = props

  const [mounted, setMounted] = useState(() => typeof document !== 'undefined' && !isHydrating())
  useEffect(() => {
    hydrated = true
    setMounted(true)
  }, [])

  return mounted ? createPortal(children, container || document.body) : null
}
