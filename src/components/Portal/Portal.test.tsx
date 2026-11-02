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
    root.innerHTML = '<p data-reactroot="">Text</p>'
    document.body.appendChild(root)

    TestUtils.act(() => {
      ReactDOM.hydrate(
        <>
          <p>Text</p>
          <IsolatedPortal>
            <span>Content</span>
          </IsolatedPortal>
        </>,
        root
      )
    })

    expect(consoleError).not.toHaveBeenCalled()
    expect(root.innerHTML).toEqual('<p data-reactroot="">Text</p>')
    expect(document.body.lastElementChild).toHaveTextContent('Content')

    consoleError.mockRestore()
    ReactDOM.unmountComponentAtNode(root)
    document.body.removeChild(root)
  })
})
