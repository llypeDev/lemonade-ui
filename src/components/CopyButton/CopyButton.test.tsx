import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { CopyButton } from './CopyButton'

jest.mock('../../util/string')

const writeText = jest.fn()

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
})

afterEach(() => {
  delete (navigator as any).clipboard
  jest.useRealTimers()
})

const click = async (element: HTMLElement) => {
  await act(async () => {
    fireEvent.click(element)
  })
}

describe('CopyButton', () => {
  it('should render correctly', () => {
    const { container } = render(<CopyButton text='npm i @lemonade/ui'>Copy command</CopyButton>)
    expect(container).toMatchSnapshot()
  })

  it('should copy the text and confirm it', async () => {
    const onCopy = jest.fn()
    const { getByRole } = render(
      <CopyButton text='ABC-123' onCopy={onCopy}>
        Copy code
      </CopyButton>
    )

    await click(getByRole('button', { name: 'Copy code' }))

    expect(writeText).toHaveBeenCalledWith('ABC-123')
    expect(onCopy).toHaveBeenCalledWith('ABC-123')
    expect(getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(getByRole('status')).toHaveTextContent('Copied')
  })

  it('should read the text from a function when clicked', async () => {
    let value = 'first'
    const { getByRole } = render(<CopyButton text={() => value}>Copy</CopyButton>)

    value = 'second'
    await click(getByRole('button'))

    expect(writeText).toHaveBeenCalledWith('second')
  })

  it('should name an icon-only button "Copy"', () => {
    const { getByRole } = render(<CopyButton text='abc' />)
    expect(getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('should go back to the idle state after the timeout', async () => {
    jest.useFakeTimers()
    const { getByRole } = render(
      <CopyButton text='abc' timeout={1000} copiedLabel='Link copied'>
        Copy link
      </CopyButton>
    )

    await click(getByRole('button'))
    expect(getByRole('button', { name: 'Link copied' })).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
    expect(getByRole('status')).toBeEmptyDOMElement()
  })

  it('should report a failure', async () => {
    const error = new Error('denied')
    writeText.mockRejectedValue(error)
    const onCopy = jest.fn()
    const onError = jest.fn()
    const { getByRole } = render(
      <CopyButton text='abc' onCopy={onCopy} onError={onError}>
        Copy
      </CopyButton>
    )

    await click(getByRole('button'))

    expect(onCopy).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(error)
    expect(getByRole('status')).toHaveTextContent('Could not copy')
  })

  it('should fall back to the copy command without the Clipboard API', async () => {
    delete (navigator as any).clipboard
    const execCommand = jest.fn(() => true)
    document.execCommand = execCommand
    const onCopy = jest.fn()
    const { getByRole } = render(
      <CopyButton text='fallback' onCopy={onCopy}>
        Copy
      </CopyButton>
    )
    const button = getByRole('button')
    button.focus()

    await click(button)

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(onCopy).toHaveBeenCalledWith('fallback')
    expect(document.querySelector('textarea')).toBeNull()
    expect(button).toHaveFocus()
  })
})
