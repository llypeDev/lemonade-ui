import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'

import { CodeBlock } from './CodeBlock'

jest.mock('../../util/string')

const code = 'yarn add @lemonade/ui\nyarn start\n'

describe('CodeBlock', () => {
  it('should render correctly', () => {
    const { container } = render(<CodeBlock code={code} language='bash' showLineNumbers />)
    expect(container).toMatchSnapshot()
  })

  it('should render the code in pre and code elements', () => {
    const { container } = render(<CodeBlock code={code} />)
    const pre = container.querySelector('pre')

    expect(pre.querySelector('code')).toHaveTextContent('yarn add @lemonade/ui yarn start')
    expect(pre).toHaveAttribute('tabindex', '0')
  })

  it('should show the title, or the language without one', () => {
    const { getByText, rerender } = render(<CodeBlock code={code} language='bash' />)
    expect(getByText('bash')).toBeInTheDocument()

    rerender(<CodeBlock code={code} language='bash' title='install.sh' />)
    expect(getByText('install.sh')).toBeInTheDocument()
  })

  it('should name the code region by its title or the locale label', () => {
    const { container, rerender } = render(<CodeBlock code={code} title='install.sh' />)
    expect(container.querySelector('pre')).toHaveAttribute('aria-label', 'install.sh')

    rerender(<CodeBlock code={code} />)
    expect(container.querySelector('pre')).toHaveAttribute('aria-label', 'Code')
  })

  it('should copy the whole code', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const { getByRole } = render(<CodeBlock code={code} />)

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Copy' }))
    })

    expect(writeText).toHaveBeenCalledWith(code)
    delete (navigator as any).clipboard
  })

  it('should hide the copy button and the header', () => {
    const { container, queryByRole } = render(<CodeBlock code={code} copyable={false} />)
    expect(queryByRole('button')).toBeNull()
    expect(container.firstElementChild.children).toHaveLength(1)
  })

  it('should number each line, without a trailing empty line', () => {
    const { container } = render(<CodeBlock code={code} showLineNumbers />)
    expect(container.querySelectorAll('code > span')).toHaveLength(2)
  })
})
