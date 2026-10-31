import { act, fireEvent, render } from '@testing-library/react'
import React, { useRef, useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { Tour, TourProps } from './Tour'

jest.mock('../../util/string')

// Popper places the step asynchronously, so each change waits for it inside act
const flush = () => act(async () => undefined)

const Page = (props: Partial<TourProps> & { startOpen?: boolean }) => {
  const { startOpen = true, ...rest } = props
  const [open, setOpen] = useState(startOpen)
  const filtersRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button onClick={() => setOpen(true)}>Start tour</button>
      <input id='search' aria-label='Search' />
      <button ref={filtersRef}>Filters</button>
      <Tour
        open={open}
        steps={[
          { title: 'Welcome', content: 'A quick look at the new orders page.' },
          { target: '#search', title: 'Search', content: 'Find an order by its number or customer.' },
          { target: filtersRef, title: 'Filters', content: 'Narrow the list by status and date.', placement: 'left' },
        ]}
        {...rest}
        onClose={(reason) => {
          setOpen(false)
          rest.onClose && rest.onClose(reason)
        }}
      />
    </>
  )
}

describe('Tour', () => {
  it('should render correctly', async () => {
    render(<Page />)
    await flush()
    expect(document.body).toMatchSnapshot()
  })

  it('should render nothing when closed', async () => {
    const { queryByRole } = render(<Page startOpen={false} />)
    await flush()
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should show the step, its position and take the focus', async () => {
    const { getByRole } = render(<Page />)
    await flush()
    const dialog = getByRole('dialog')

    expect(dialog).toHaveFocus()
    expect(dialog).toHaveTextContent('Step 1 of 3')
    expect(dialog).toHaveAttribute('aria-labelledby', document.querySelector('h2').id)
    expect(getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-describedby')
    expect(document.getElementById(dialog.getAttribute('aria-describedby'))).toHaveTextContent(
      'A quick look at the new orders page.'
    )
  })

  it('should go forward and back', async () => {
    const onStepChange = jest.fn()
    const { getByRole, queryByRole } = render(<Page onStepChange={onStepChange} />)
    await flush()

    expect(queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Next' }))
    await flush()
    expect(getByRole('heading', { name: 'Search' })).toBeInTheDocument()
    expect(getByRole('dialog')).toHaveTextContent('Step 2 of 3')
    expect(getByRole('dialog')).toHaveFocus()

    fireEvent.click(getByRole('button', { name: 'Back' }))
    await flush()
    expect(getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    expect(onStepChange.mock.calls).toEqual([[1], [0]])
  })

  it('should finish on the last step', async () => {
    const onClose = jest.fn()
    const { getByRole, queryByRole } = render(<Page onClose={onClose} defaultStep={2} />)
    await flush()

    expect(queryByRole('button', { name: 'Skip tour' })).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Done' }))
    await flush()
    expect(onClose).toHaveBeenCalledWith('done')
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should skip with the skip button and Escape', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(<Page onClose={onClose} />)
    await flush()

    fireEvent.click(getByRole('button', { name: 'Skip tour' }))
    await flush()
    expect(onClose).toHaveBeenLastCalledWith('skip')

    fireEvent.click(getByRole('button', { name: 'Start tour' }))
    await flush()
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(onClose).toHaveBeenLastCalledWith('skip')
  })

  it('should give the focus back when it closes', async () => {
    const { getByRole } = render(<Page startOpen={false} />)
    await flush()
    const start = getByRole('button', { name: 'Start tour' })

    start.focus()
    fireEvent.click(start)
    await flush()
    expect(getByRole('dialog')).toHaveFocus()

    fireEvent.click(getByRole('button', { name: 'Skip tour' }))
    await flush()
    expect(start).toHaveFocus()
  })

  it('should start again from the first step each time it opens', async () => {
    const { getByRole } = render(<Page startOpen={false} />)
    await flush()

    fireEvent.click(getByRole('button', { name: 'Start tour' }))
    await flush()
    fireEvent.click(getByRole('button', { name: 'Next' }))
    await flush()
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    fireEvent.click(getByRole('button', { name: 'Start tour' }))
    await flush()
    expect(getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
  })

  it('should put a spotlight on the target of the step', async () => {
    const { getByRole } = render(<Page defaultStep={1} />)
    await flush()
    const search = getByRole('textbox', { name: 'Search' })
    search.getBoundingClientRect = () => ({ top: 100, left: 50, width: 200, height: 32, bottom: 132 } as DOMRect)

    fireEvent.click(getByRole('button', { name: 'Next' }))
    await flush()
    fireEvent.click(getByRole('button', { name: 'Back' }))
    await flush()

    const spotlight = document.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(spotlight.style.top).toBe('96px')
    expect(spotlight.style.left).toBe('46px')
    expect(spotlight.style.width).toBe('208px')
    expect(spotlight.style.height).toBe('40px')
  })

  it('should follow a controlled step', async () => {
    const { getByRole, rerender } = render(
      <Tour open step={0} onClose={jest.fn()} steps={[{ title: 'One' }, { title: 'Two' }]} />
    )
    await flush()
    fireEvent.click(getByRole('button', { name: 'Next' }))
    await flush()
    expect(getByRole('heading', { name: 'One' })).toBeInTheDocument()

    rerender(<Tour open step={1} onClose={jest.fn()} steps={[{ title: 'One' }, { title: 'Two' }]} />)
    expect(getByRole('heading', { name: 'Two' })).toBeInTheDocument()
  })

  it('should use the locale strings', async () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Page />
      </LocaleContext.Provider>
    )
    await flush()
    expect(getByRole('dialog')).toHaveTextContent('Passo 1 de 3')
    expect(getByRole('button', { name: 'Pular tour' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Próximo' })).toBeInTheDocument()
  })
})
