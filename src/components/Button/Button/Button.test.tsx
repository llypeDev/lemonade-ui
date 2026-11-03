import { act, fireEvent, render } from '@testing-library/react'
import React from 'react'
import waait from 'waait'

import { LocaleContext } from '../../../i18n'
import ptBR from '../../../i18n/locales/pt-BR'
import { createTheme, focusBoxShadow } from '../../../styles'
import { focusRingStates, resolveStyle } from '../../../test/utils/resolveStyle'
import { Icon } from '../../Icon'

import { Button } from './Button'

it('should render correctly with label', () => {
  const { container } = render(<Button>Button</Button>)
  expect(container).toMatchSnapshot()
})

it('should have the "button" type to avoid default submit behaviour inside forms', () => {
  const { container } = render(<Button>Button</Button>)
  expect(container.querySelector('button').getAttribute('type')).toEqual('button')
})

it('should render correctly with icon', () => {
  const { container } = render(
    <Button>
      <Icon icon='adjust' />
    </Button>
  )
  expect(container).toMatchSnapshot()
})

it('should render the default skin', () => {
  expect(
    render(
      <Button skin='default' kind='normal'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
  expect(
    render(
      <Button skin='default' kind='primary'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
  expect(
    render(
      <Button skin='default' kind='danger'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
})

it('should render the ghost skin', () => {
  expect(
    render(
      <Button skin='ghost' kind='normal'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
  expect(
    render(
      <Button skin='ghost' kind='primary'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
  expect(
    render(
      <Button skin='ghost' kind='danger'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
})

it('should render the outline skin', () => {
  expect(
    render(
      <Button skin='outline' kind='normal'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
  expect(
    render(
      <Button skin='outline' kind='primary'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
  expect(
    render(
      <Button skin='outline' kind='danger'>
        Button
      </Button>
    ).container
  ).toMatchSnapshot()
})

describe('focus ring', () => {
  const theme = createTheme()
  const skins = ['default', 'ghost', 'outline'] as const
  const kinds = ['normal', 'primary', 'danger'] as const

  skins.forEach((skin) =>
    kinds.forEach((kind) =>
      it(`should show it for the keyboard, not after a click, on the ${skin} skin of the ${kind} kind`, () => {
        const { getByRole } = render(
          <Button skin={skin} kind={kind}>
            Save
          </Button>
        )
        const { received, expected } = focusRingStates(getByRole('button'))
        expect(received).toEqual(expected)
      })
    )
  )

  it('should keep the ring it shows for the keyboard', () => {
    const { getByRole } = render(<Button kind='danger'>Delete</Button>)
    // Without the spaces after the commas, as emotion writes it
    expect(focusRingStates(getByRole('button')).keyboard).toEqual(focusBoxShadow(theme, 'danger').replace(/, /g, ','))
  })
})

it('should have a "loading" animation when onClick return is a Promise', async () => {
  const delayedFunction = () => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 10)
    })
  }

  const { container } = render(<Button onClick={delayedFunction}>Button</Button>)
  const button = container.querySelector('button')
  expect(button.getAttribute('data-loading')).toBeFalsy()

  fireEvent.click(button)
  expect(button.getAttribute('data-loading')).toEqual('true')

  // The promise settles inside act, not while the test cleans up after a slow render
  await act(() => waait(20))
  expect(button.getAttribute('data-loading')).toBeFalsy()
})

it('shoud not emit a "setState while unmounted" react warning when component is unmounted while loading', async () => {
  const delayedFunction = () => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 10)
    })
  }

  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => null)
  try {
    const { container, unmount } = render(<Button onClick={delayedFunction}>Button</Button>)
    const button = container.querySelector('button')

    fireEvent.click(button)
    unmount()

    await waait(20)
    const warnings = consoleError.mock.calls.filter(([message]) => String(message).includes('unmounted component'))
    expect(warnings).toEqual([])
  } finally {
    consoleError.mockRestore()
  }
})

it('should keep the loading animation when "onLoadingChange" is given and call it too', async () => {
  let resolve: () => void
  const delayedFunction = () => new Promise<void>((r) => (resolve = r))
  const click = jest.fn(delayedFunction)
  const onLoadingChange = jest.fn()

  const { container } = render(
    <Button onClick={click} onLoadingChange={onLoadingChange}>
      Button
    </Button>
  )
  const button = container.querySelector('button')

  fireEvent.click(button)
  expect(button.getAttribute('data-loading')).toEqual('true')
  expect(onLoadingChange).toHaveBeenLastCalledWith(true)

  // A second click while loading does not run onClick again
  fireEvent.click(button)
  expect(click).toHaveBeenCalledTimes(1)

  await act(async () => {
    resolve()
    await waait(0)
  })
  expect(onLoadingChange).toHaveBeenLastCalledWith(false)
  expect(button.getAttribute('data-loading')).toBeFalsy()
})

it('should NOT have animation when onClick return is not a Promise', () => {
  const func = () => undefined
  const { container } = render(<Button onClick={func}>Button</Button>)
  const button = container.querySelector('button')
  expect(button.getAttribute('data-loading')).toBeFalsy()

  fireEvent.click(button)
  expect(button.getAttribute('data-loading')).toBeFalsy()
})

it('should accept the loading prop', () => {
  const { container } = render(<Button loading={true}>Button</Button>)
  expect(container).toMatchSnapshot()
})

it('should disable click event when loading', () => {
  const click = jest.fn()
  const { container, rerender } = render(
    <Button onClick={click} loading={true}>
      Button
    </Button>
  )
  fireEvent.click(container.querySelector('button'))
  expect(click).not.toHaveBeenCalled()

  rerender(
    <Button onClick={click} loading={false}>
      Button
    </Button>
  )
  fireEvent.click(container.querySelector('button'))
  expect(click).toHaveBeenCalledTimes(1)
})

describe('while loading', () => {
  it('should tell screen readers it is busy and unavailable, and keep the focus', () => {
    const { getByRole, rerender } = render(<Button loading>Save</Button>)
    const button = getByRole('button')

    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    // The native disabled would take the focus away from the button
    expect(button).not.toBeDisabled()
    button.focus()
    expect(button).toHaveFocus()

    rerender(<Button loading={false}>Save</Button>)
    expect(button).not.toHaveAttribute('aria-busy')
    expect(button).not.toHaveAttribute('aria-disabled')
    expect(button).toHaveFocus()
  })

  it('should tell it while the promise of onClick is pending', async () => {
    let resolve: () => void
    const { getByRole } = render(<Button onClick={() => new Promise<void>((r) => (resolve = r))}>Save</Button>)
    const button = getByRole('button')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(getByRole('button', { name: 'Save Loading' })).toBe(button)

    await act(async () => {
      resolve()
      await waait(0)
    })
    expect(button).not.toHaveAttribute('aria-busy')
    expect(button).not.toHaveAttribute('aria-disabled')
    expect(getByRole('button', { name: 'Save' })).toBe(button)
  })

  it('should say "Loading" to screen readers, from the locale strings, without showing it', () => {
    const { getByRole, getByText, rerender } = render(<Button loading>Save</Button>)

    expect(getByRole('button', { name: 'Save Loading' })).toBeInTheDocument()
    expect(resolveStyle(getByText('Loading'), 'position')).toEqual('absolute')
    expect(resolveStyle(getByText('Loading'), 'clip')).toEqual('rect(0,0,0,0)')
    // The label keeps its place, so the button keeps its width
    expect(resolveStyle(getByText('Save'), 'color')).toEqual('transparent')

    rerender(
      <LocaleContext.Provider value={ptBR}>
        <Button loading>Salvar</Button>
      </LocaleContext.Provider>
    )
    expect(getByRole('button', { name: 'Salvar Carregando' })).toBeInTheDocument()

    rerender(<Button>Save</Button>)
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('should keep the aria-disabled and aria-busy it is given when it is not loading', () => {
    const { getByRole } = render(
      <Button aria-disabled aria-busy={false}>
        Save
      </Button>
    )
    expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    expect(getByRole('button')).toHaveAttribute('aria-busy', 'false')
  })
})

it('shoud allow override of the "component" prop', () => {
  const { container } = render(<Button component='a'>A link button</Button>)
  expect(container).toMatchSnapshot()
})
