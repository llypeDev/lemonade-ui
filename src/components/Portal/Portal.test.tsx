import { render } from '@testing-library/react'
import React from 'react'

import { Portal } from './Portal'

describe('Portal', () => {
  it('should render the children in the body', () => {
    render(
      <Portal>
        <span>Content</span>
      </Portal>
    )
    expect(document.body.lastElementChild).toHaveTextContent('Content')
  })

  it('should render the children in the container from the first render', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      <Portal container={container}>
        <span>Content</span>
      </Portal>
    )
    expect(container).toHaveTextContent('Content')

    document.body.removeChild(container)
  })

  it('should move the children when the container changes', () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)

    const { rerender } = render(
      <Portal container={first}>
        <span>Content</span>
      </Portal>
    )
    rerender(
      <Portal container={second}>
        <span>Content</span>
      </Portal>
    )
    expect(first).toBeEmptyDOMElement()
    expect(second).toHaveTextContent('Content')

    document.body.removeChild(first)
    document.body.removeChild(second)
  })

  it('should hydrate the page rendered on the server, which has no portal', () => {
    // A page that has not hydrated yet, so no portal came before. The modules are loaded again, with their own React.
    jest.resetModules()
    const IsolatedPortal: typeof Portal = require('./Portal').Portal
    const ReactDOM: typeof import('react-dom') = require('react-dom')
    const TestUtils: typeof import('react-dom/test-utils') = require('react-dom/test-utils')
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    // The server has no document, so its page has no portal
    const root = document.createElement('div')
    root.innerHTML = '<div data-reactroot=""><p>Text</p></div>'
    document.body.appendChild(root)

    TestUtils.act(() => {
      ReactDOM.hydrate(
        <div>
          <p>Text</p>
          <IsolatedPortal>
            <span>Content</span>
          </IsolatedPortal>
        </div>,
        root
      )
    })

    expect(consoleError).not.toHaveBeenCalled()
    expect(root.innerHTML).toEqual('<div data-reactroot=""><p>Text</p></div>')
    expect(document.body.lastElementChild).toHaveTextContent('Content')

    consoleError.mockRestore()
    ReactDOM.unmountComponentAtNode(root)
    document.body.removeChild(root)
  })

  it('should render the children at once when it opens after the page rendered on the server hydrated', () => {
    // A page with no portal while it hydrates. The modules are loaded again, so their React is a new one too.
    jest.resetModules()
    const IsolatedReact: typeof React = require('react')
    const IsolatedPortal: typeof Portal = require('./Portal').Portal
    const ReactDOM: typeof import('react-dom') = require('react-dom')
    const TestUtils: typeof import('react-dom/test-utils') = require('react-dom/test-utils')

    // Focuses its content in its own first effect, as Drawer, ImageViewer and CommandPalette do
    function Dialog() {
      const closeRef = IsolatedReact.useRef<HTMLButtonElement>(null)
      IsolatedReact.useEffect(() => {
        closeRef.current && closeRef.current.focus()
      }, [])
      return (
        <IsolatedPortal>
          <button ref={closeRef}>Close</button>
        </IsolatedPortal>
      )
    }

    function Page() {
      const [open, setOpen] = IsolatedReact.useState(false)
      return (
        <div>
          <button onClick={() => setOpen(true)}>Open</button>
          {open && <Dialog />}
        </div>
      )
    }

    const root = document.createElement('div')
    root.innerHTML = '<div data-reactroot=""><button>Open</button></div>'
    document.body.appendChild(root)
    TestUtils.act(() => {
      ReactDOM.hydrate(<Page />, root)
    })

    TestUtils.act(() => {
      root.querySelector('button').click()
    })
    expect(document.activeElement.textContent).toEqual('Close')

    ReactDOM.unmountComponentAtNode(root)
    document.body.removeChild(root)
  })
})
