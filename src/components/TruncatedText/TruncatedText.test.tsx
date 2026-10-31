import { render } from '@testing-library/react'
import React from 'react'

import { TruncatedText } from './TruncatedText'

const mockSize = (size: {
  scrollWidth?: number
  clientWidth?: number
  scrollHeight?: number
  clientHeight?: number
}) => {
  const spies = Object.keys(size).map((key) =>
    jest.spyOn(HTMLElement.prototype, key as any, 'get').mockReturnValue(size[key])
  )
  return () => spies.forEach((spy) => spy.mockRestore())
}

describe('TruncatedText', () => {
  it('should render correctly', () => {
    const { container } = render(<TruncatedText>Annual report 2024 final version.pdf</TruncatedText>)
    expect(container).toMatchSnapshot()
  })

  it('should not have a tooltip nor take the focus when the text fits', () => {
    const restore = mockSize({ scrollWidth: 100, clientWidth: 100 })
    const { getByText } = render(<TruncatedText>Short name</TruncatedText>)

    const text = getByText('Short name')
    expect(text).not.toHaveAttribute('tabindex')
    expect(text).not.toHaveAttribute('title')
    restore()
  })

  it('should show the whole text in a tooltip and take the focus when the text is cut', () => {
    const restore = mockSize({ scrollWidth: 300, clientWidth: 100 })
    const { getByText } = render(<TruncatedText>Annual report 2024 final version.pdf</TruncatedText>)

    const text = getByText('Annual report 2024 final version.pdf')
    expect(text).toHaveAttribute('tabindex', '0')
    expect(text).toHaveAttribute('title', 'Annual report 2024 final version.pdf')
    restore()
  })

  it('should measure the height when it shows more than one line', () => {
    const restore = mockSize({ scrollWidth: 300, clientWidth: 100, scrollHeight: 40, clientHeight: 40 })
    const { getByText } = render(<TruncatedText lines={2}>Two lines of text</TruncatedText>)
    expect(getByText('Two lines of text')).not.toHaveAttribute('tabindex')
    restore()

    const restoreTall = mockSize({ scrollHeight: 80, clientHeight: 40 })
    const { getByText: getAgain } = render(<TruncatedText lines={2}>A longer paragraph</TruncatedText>)
    expect(getAgain('A longer paragraph')).toHaveAttribute('tabindex', '0')
    restoreTall()
  })

  it('should take the tooltip from the text of rich children, or from the tooltip prop', () => {
    const restore = mockSize({ scrollWidth: 300, clientWidth: 100 })
    const { container, rerender } = render(
      <TruncatedText>
        <strong>Ana</strong> commented on the file
      </TruncatedText>
    )
    expect(container.firstChild).toHaveAttribute('title', 'Ana commented on the file')

    rerender(<TruncatedText tooltip='Comment by Ana'>Ana commented on the file</TruncatedText>)
    expect(container.firstChild).toHaveAttribute('title', 'Comment by Ana')
    restore()
  })

  it('should render another element', () => {
    const { container } = render(
      <TruncatedText component='p' lines={3}>
        Paragraph
      </TruncatedText>
    )
    expect(container.querySelector('p')).toHaveTextContent('Paragraph')
  })
})
