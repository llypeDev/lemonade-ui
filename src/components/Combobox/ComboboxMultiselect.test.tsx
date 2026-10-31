import React, { forwardRef, useRef, useState } from 'react'
import { act, render, fireEvent, getByTestId, waitFor } from '@testing-library/react'
import matchSorter from 'match-sorter'
import waait from 'waait'
import { Text } from '../Text'
import { useTheme } from '../../styles'
import { HFlow } from '../HFlow'
import { Button } from '../Button'
import {
  ComboboxItemProps,
  ComboboxMenuItem,
  ComboboxMultiselectSelectedItem,
  ComboboxMultiselectSelectedItemProps,
} from './ComboboxMenuComponents'
import { Combobox } from './Combobox'
import { ComboboxMultiselect, ComboboxMultiselectProps } from './ComboboxMultiselect'

// Lets pending updates settle inside act. Each wait starts after the previous one ends, so the debounce, the
// simulated load and its update all finish first, even when timers run late on a busy machine
const flush = () =>
  act(async () => {
    for (let round = 0; round < 3; round++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 20))
    }
  })

const TOGGLE_BUTTON_ID = 'test-toggle-button-id'
const MENU_ID = 'test-menu-id'

interface Fruit {
  value: number
  label: string
}

const fruits: Fruit[] = [
  { value: 1, label: 'Apple' },
  { value: 2, label: 'Avocado' },
  { value: 3, label: 'Banana' },
  { value: 4, label: 'Blueberry' },
  { value: 5, label: 'Coconut' },
  { value: 6, label: 'Grape' },
  { value: 7, label: 'Lemon' },
  { value: 8, label: 'Mango' },
  { value: 9, label: 'Melon' },
  { value: 10, label: 'Orange' },
  { value: 11, label: 'Peach' },
  { value: 12, label: 'Pear' },
]

const itemToString = (item: Fruit) => item?.label

const asyncDelay = 10
const loadFruitsAsync = (query: string): Promise<Fruit[]> => {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          matchSorter<Fruit>(fruits, query, { keys: [(item) => item?.label] })
        ),
      asyncDelay
    )
  })
}

const waitForOptions = (baseElement: HTMLElement) =>
  waitFor(() => {
    const options = baseElement.querySelectorAll('li')
    expect(options).toHaveLength(fruits.length)
    return options
  })

const ComboboxTest = (props: Partial<ComboboxMultiselectProps<Fruit>> & { async?: boolean }) => (
  <ComboboxMultiselect<typeof fruits[0]>
    items={props.async ? loadFruitsAsync : fruits}
    itemToString={itemToString}
    debounceMilliseconds={0}
    itemIsEqual={(a, b) => a?.value === b?.value}
    openOnFocus
    loading={false}
    components={{
      SelectedItem: forwardRef<HTMLSpanElement, ComboboxMultiselectSelectedItemProps>((props, ref) => (
        <ComboboxMultiselectSelectedItem ref={ref} {...props} data-testid={`${props.children}`} />
      )),
    }}
    inputId={'test-input-id'}
    labelId={'test-label-id'}
    menuId={MENU_ID}
    toggleButtonId={TOGGLE_BUTTON_ID}
    getItemId={(index) => `test-item-id-${index}`}
    {...props}
  />
)

function CustomComponent(props: React.HTMLAttributes<HTMLDivElement>) {
  const theme = useTheme()

  return (
    <div
      style={{
        background: theme.pallete.surface.background,
        padding: '0.25rem 0.5rem',
        cursor: 'initial',
      }}
      {...props}
    />
  )
}

// The action and onRemove are used by the custom items, not passed to the component
const ComboboxWithCustomComponentsTest = ({
  action,
  onRemove,
  ...props
}: Partial<ComboboxMultiselectProps<Fruit>> & { action?: () => void; onRemove?: () => void }) => (
  <ComboboxMultiselect<typeof fruits[0]>
    label='Fruit'
    name='fruit'
    items={fruits}
    itemToString={itemToString}
    debounceMilliseconds={0}
    itemIsEqual={(a, b) => a.value === b.value}
    openOnFocus
    loading={false}
    inputId={'test-input-id'}
    labelId={'test-label-id'}
    menuId={MENU_ID}
    toggleButtonId={TOGGLE_BUTTON_ID}
    getItemId={(index) => `test-item-id-${index}`}
    components={{
      SelectedItem: forwardRef<HTMLSpanElement, ComboboxMultiselectSelectedItemProps>((props, ref) => (
        <ComboboxMultiselectSelectedItem ref={ref} onRemove={props.onRemove}>
          Selected item
        </ComboboxMultiselectSelectedItem>
      )),
      Item: forwardRef<HTMLLIElement, ComboboxItemProps<Fruit>>((props, ref) => (
        <ComboboxMenuItem ref={ref} {...props}>
          <Text color='success'>Custom {props.itemToString(props.item)}</Text>
        </ComboboxMenuItem>
      )),
      PrependItem: (props) => <CustomComponent>Prepend item</CustomComponent>,
      EmptyItem: (props) => <CustomComponent>Empty item</CustomComponent>,
      CreateItem: (props) => <CustomComponent>Create item</CustomComponent>,
      LoadingItem: (props) => <CustomComponent>Loading item...</CustomComponent>,
      AppendItem: (propsItem) => (
        <CustomComponent>
          <HFlow alignItems='center' justifyContent='space-between'>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime quod modi, inventore quasi aut sed beatae
              corrupti repellendus minima voluptatem debitis, quibusdam repudiandae totam voluptatum odit.
            </Text>
            <Button kind='primary' size='small' data-testid='action-btn' onClick={() => action?.()}>
              New item
            </Button>
          </HFlow>
        </CustomComponent>
      ),
    }}
    {...props}
  />
)

test.each`
  async
  ${true}
  ${false}
`('has aria-compliant attributes (async: $async)', async ({ async }) => {
  // From https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html
  const { baseElement } = render(<ComboboxTest label='Fruits' async={async} />)

  const combobox = baseElement.querySelector('[role="combobox"]')!
  const label = baseElement.querySelector('label')!
  const input = baseElement.querySelector('input')!
  const listbox = baseElement.querySelector('[role="listbox"]')!
  const dropdownButton = baseElement.querySelector('button')!

  expect(combobox).toHaveAttribute('aria-controls', listbox.getAttribute('id'))
  expect(combobox).toHaveAttribute('aria-expanded', 'false')

  expect(label).toHaveAttribute('id')
  expect(label).toHaveAttribute('for', input.getAttribute('id'))
  expect(label).toHaveTextContent('Fruits')

  expect(input).toHaveAttribute('id')
  expect(input).toHaveAttribute('aria-autocomplete', 'list')
  expect(input).toHaveAttribute('aria-controls', listbox.getAttribute('id'))
  expect(input).toHaveAttribute('aria-labelledby', label.getAttribute('id'))

  expect(dropdownButton).toHaveAttribute('tabindex', '-1')
  expect(dropdownButton).toHaveAttribute('aria-label')

  expect(listbox).toHaveAttribute('id')
  expect(listbox).toHaveAttribute('aria-labelledby', label.getAttribute('id'))

  //Opens menu
  fireEvent.focus(input)
  expect(combobox).toHaveAttribute('aria-expanded', 'true')
  await waitFor(() => expect(listbox.querySelector('[role="option"]:not([aria-disabled="true"])')).toBeTruthy())

  fireEvent.keyDown(combobox, { key: 'ArrowDown' })

  await waitFor(() => expect(listbox.querySelector('[aria-selected="true"]')?.textContent).toBe(fruits[0].label))
  expect(combobox).toHaveAttribute('aria-activedescendant', listbox.querySelector('[aria-selected="true"]')?.id)
  await flush()
})

test.each`
  async
  ${true}
  ${false}
`('opens/closes menu when input button is clicked (async: $async)', async ({ async }) => {
  const { baseElement } = render(<ComboboxTest async={async} />)

  const iconButton = baseElement.querySelector('button')!
  const input = baseElement.querySelector('input')

  await waitFor(() => expect(document.activeElement).toEqual(document.body))

  fireEvent.click(iconButton)

  expect(baseElement.querySelector('ul')).toBeTruthy()
  await waitFor(() => expect(document.activeElement).toEqual(input))

  fireEvent.click(iconButton)

  expect(baseElement.querySelector('ul')).toBeFalsy()
  await flush()
})

test.each`
  async
  ${true}
  ${false}
`('opens menu when input is focused and only when `openOnFocus` prop is true (async: $async)', async ({ async }) => {
  const { baseElement, rerender } = render(<ComboboxTest async={async} />)

  const input = baseElement.querySelector('input')!

  // initial state has closed menu
  expect(baseElement.querySelector('ul')).toBeFalsy()

  // focus input to open menu
  fireEvent.focus(input)
  expect(baseElement.querySelector('ul')).toBeTruthy()

  // blur input to close menu
  fireEvent.blur(input)
  expect(baseElement.querySelector('ul')).toBeFalsy()
  // rerenders switching prop
  await act(async () => rerender(<ComboboxTest openOnFocus={false} />))

  // focus input and now menu should not be open
  fireEvent.focus(input)
  expect(baseElement.querySelector('ul')).toBeFalsy()
  await flush()
})

it('shows placeholder when specified', async () => {
  const placeholder = 'test placeholder'
  const { baseElement } = render(<ComboboxTest placeholder={placeholder} />)

  const input = baseElement.querySelector('input')

  expect(input).toHaveAttribute('placeholder', placeholder)
  await flush()
})

it('does not show placeholder when not specified', async () => {
  const { baseElement } = render(<ComboboxTest />)

  const input = baseElement.querySelector('input')

  expect(input).not.toHaveAttribute('placeholder')
  await flush()
})

it('does not show placeholder if any item is selected', async () => {
  const { baseElement } = render(<ComboboxTest items={[fruits[0]]} />)

  const input = baseElement.querySelector('input')

  expect(input).not.toHaveAttribute('placeholder')
  await flush()
})

it.each`
  async
  ${true}
  ${false}
`('shows/hides selection when they are clicked (async: $async)', async ({ async }) => {
  const { baseElement, findByTestId } = render(<ComboboxTest async={async} />)

  const input = baseElement.querySelector('input')!
  //Opens menu
  fireEvent.focus(input)

  const options = await waitForOptions(baseElement)

  //Selects items
  fireEvent.click(options[0])
  fireEvent.click(options[4])

  const selected1 = await findByTestId(options[0].textContent!)
  expect(selected1).toBeInTheDocument()

  const selected2 = await findByTestId(options[4].textContent!)
  expect(selected2).toBeInTheDocument()

  fireEvent.click(options[0].firstChild!)

  //Checks if cleared
  const notCleared = baseElement.querySelector(`[data-testid="${options[4].textContent}"]`)
  expect(notCleared).not.toBeNull()
  const cleared = baseElement.querySelector(`[data-testid="${options[0].textContent}"]`)
  expect(cleared).toBeNull()
  await flush()
})

it.each`
  async
  ${true}
  ${false}
`('clears selection when "Clear" is clicked (async: $async)', async ({ async }) => {
  const { baseElement, findByTestId } = render(<ComboboxTest clearable={true} async={async} />)

  const input = baseElement.querySelector('input')!
  //Opens menu
  fireEvent.focus(input)

  const options = await waitForOptions(baseElement)

  //Selects items
  fireEvent.click(options[0])

  fireEvent.click(options[1])

  const selected1 = await findByTestId(options[0].textContent!)
  expect(selected1).toBeInTheDocument()

  const selected2 = await findByTestId(options[1].textContent!)
  expect(selected2).toBeInTheDocument()

  const clearButton = baseElement.querySelector('[title="Clear"]')
  expect(clearButton).toBeInTheDocument()

  //Clears value and focus out
  fireEvent.click(clearButton!)

  //Checks if cleared
  await waitFor(() => {
    const cleared1 = baseElement.querySelector(`[data-testid="${options[0].textContent}"]`)
    expect(cleared1).toBeNull()
    const cleared2 = baseElement.querySelector(`[data-testid="${options[1].textContent}"]`)
    expect(cleared2).toBeNull()
  })
  await flush()
})

it('enters error state', async () => {
  const errorMessage = 'error'
  const { baseElement } = render(<ComboboxTest error={errorMessage} />)

  const input = baseElement.querySelector('input')!

  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input).toHaveAttribute('aria-errormessage')

  const errorMessageContainer = baseElement.querySelector(`#${input.getAttribute('aria-errormessage')}`)
  expect(errorMessageContainer).toHaveTextContent(errorMessage)
  await flush()
})

it('respects menu min-width', async () => {
  const { baseElement } = render(<ComboboxTest menuMinWidth={1000} />)

  const input = baseElement.querySelector('input')!
  //Opens menu
  fireEvent.focus(input)

  const menu = getByTestId(baseElement, 'menu')

  expect(menu).toHaveStyle('min-width: 1000px')
  await flush()
})

it.each`
  async
  ${true}
  ${false}
`('should trigger onChange (async: $async)', async ({ async }) => {
  const onChange = jest.fn()
  const { baseElement } = render(<ComboboxTest onChange={onChange} async={async} />)

  const input = baseElement.querySelector('input')!
  //Opens menu
  fireEvent.focus(input)

  const options = await waitForOptions(baseElement)

  expect(onChange).not.toHaveBeenCalled()

  //Selects first 2 items
  fireEvent.click(options[0])

  expect(onChange).toHaveBeenLastCalledWith([fruits[0]])

  fireEvent.click(options[2])

  expect(onChange).toHaveBeenLastCalledWith([fruits[0], fruits[2]])
  expect(onChange).toHaveBeenCalledTimes(2)
  await flush()
})

it('should not call onChange when filter is typed and cleared - no selected values', async () => {
  const change = jest.fn()
  const { container } = render(<ComboboxTest onChange={change} />)

  const input = container.querySelector('input')!

  fireEvent.change(input, { target: { value: 'app' } })
  fireEvent.change(input, { target: { value: '' } })

  expect(change).not.toHaveBeenCalled()
  await flush()
})

it('should not call onChange when filter is typed and cleared - with selected values', async () => {
  const onChange = jest.fn()
  const { baseElement } = render(<ComboboxTest onChange={onChange} />)

  const input = baseElement.querySelector('input')!
  //Opens menu
  fireEvent.focus(input)

  const options = await waitForOptions(baseElement)

  expect(onChange).not.toHaveBeenCalled()

  //Selects first 2 items
  fireEvent.click(options[0])
  fireEvent.click(options[2])

  fireEvent.change(input, { target: { value: 'app' } })
  fireEvent.change(input, { target: { value: '' } })

  expect(onChange).toHaveBeenLastCalledWith([fruits[0], fruits[2]])
  expect(onChange).toHaveBeenCalledTimes(2)
  await flush()
})

it.each`
  async
  ${true}
  ${false}
`('should trigger onFilterChange (async: $async)', async ({ async }) => {
  let filter = ''

  const { baseElement } = render(<ComboboxTest onFilterChange={(nValue) => (filter = nValue)} async={async} />)

  expect(filter).toBe('')

  const input = baseElement.querySelector('input')!
  fireEvent.change(input, { target: { value: 'filter' } })

  expect(filter).toBe('filter')
  await flush()
})

it('should trigger onFocus', async () => {
  const onFocus = jest.fn()

  const { baseElement } = render(<ComboboxTest onFocus={onFocus} />)

  const input = baseElement.querySelector('input')!
  fireEvent.focus(input)
  expect(onFocus).toBeCalled()
  await flush()
})

it('should trigger onBlur', async () => {
  const onBlur = jest.fn()

  const { baseElement } = render(<ComboboxTest onBlur={onBlur} />)

  const input = baseElement.querySelector('input')!
  fireEvent.focus(input)
  fireEvent.blur(input)
  expect(onBlur).toBeCalled()
  await flush()
})

it.each`
  async
  ${true}
  ${false}
`('should clear input if the value is not valid (async: $async)', async ({ async }) => {
  const { baseElement } = render(<ComboboxTest async={async} />)

  const input = baseElement.querySelector('input')!
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: 'not a fruit' } })
  fireEvent.blur(input)
  expect(input).not.toHaveValue()
  await flush()
})

it.each`
  async
  ${true}
  ${false}
`('should accept a value as parameter (async: $async)', async ({ async }) => {
  const { findByTestId } = render(<ComboboxTest value={[fruits[1], fruits[3]]} async={async} />)

  const selected1 = await findByTestId(fruits[1].label)
  const selected2 = await findByTestId(fruits[3].label)
  expect(selected1).toBeInTheDocument()
  expect(selected2).toBeInTheDocument()
  await flush()
})

it('should accept actions inside children prop', async () => {
  const click = jest.fn()
  const { baseElement, findByTestId } = render(<ComboboxWithCustomComponentsTest action={click} />)

  const input = baseElement.querySelector('input')!
  //Opens menu
  fireEvent.focus(input)

  fireEvent.click(await findByTestId('action-btn'))

  expect(click).toHaveBeenCalledTimes(1)
  await flush()
})

test.each`
  async
  ${true}
  ${false}
`('keeps menu open based on the `open` prop(async: $async)', async ({ async }) => {
  const { baseElement, rerender } = render(<ComboboxTest async={async} open />)

  const input = baseElement.querySelector('input')!

  // initial state has open menu
  expect(baseElement.querySelector('ul')).toBeTruthy()

  // blur input
  fireEvent.blur(input)
  expect(baseElement.querySelector('ul')).toBeTruthy()

  // rerenders switching prop
  await act(async () => rerender(<ComboboxTest async={async} open={false} />))
  expect(baseElement.querySelector('ul')).toBeFalsy()

  // focus input
  fireEvent.focus(input)
  expect(baseElement.querySelector('ul')).toBeFalsy()
  await flush()
})

describe('rendering', () => {
  it('renders correcly closed', async () => {
    const { baseElement } = render(<ComboboxTest label='Fruits' />)

    expect(baseElement).toMatchSnapshot()
    await flush()
  })

  it('renders correcly opened', async () => {
    const { baseElement } = render(<ComboboxTest label='Fruits' />)

    const input = baseElement.querySelector('input')!
    //Opens menu
    fireEvent.focus(input)
    await act(() => waait(asyncDelay))
    expect(baseElement).toMatchSnapshot()
    await flush()
  })

  it('renders correcly opened and loading', async () => {
    const { baseElement } = render(<ComboboxTest label='Fruits' loading={true} />)

    const input = baseElement.querySelector('input')!
    //Opens menu
    fireEvent.focus(input)
    await act(() => waait(asyncDelay))
    expect(baseElement).toMatchSnapshot()
    await flush()
  })

  it('renders correcly with custom components correctly', async () => {
    const { baseElement } = render(<ComboboxWithCustomComponentsTest />)

    const input = baseElement.querySelector('input')!
    //Opens menu
    fireEvent.focus(input)
    await act(() => waait(asyncDelay))
    expect(baseElement).toMatchSnapshot()
    await flush()
  })
})

describe('async loading', () => {
  it('should NOT call "loadItems" when mounted', async () => {
    const loadItems = jest.fn(() => Promise.resolve(['Item 1', 'Item 2']))
    render(<Combobox items={loadItems} />)

    expect(loadItems).not.toHaveBeenCalledWith()
    await flush()
  })

  it('should call "loadItems" on first interaction', async () => {
    const loadItems = jest.fn(() => Promise.resolve(['Item 1', 'Item 2']))
    const { container } = render(<Combobox items={loadItems} itemToString={(item) => item} />)

    container.querySelector('input')?.focus()

    await waitFor(() => {
      expect(loadItems).not.toHaveBeenCalledWith()
      expect(loadItems).toHaveBeenCalledWith('')
    })
    await flush()
  })
})

describe('filtering', () => {
  test.each`
    clearFilterOnSelect
    ${true}
    ${false}
  `(
    'should clear the current filter and the input value after menu is closed (clearFilterOnSelect: $clearFilterOnSelect)',
    async ({ clearFilterOnSelect }) => {
      const { container } = render(<ComboboxTest clearFilterOnSelect={clearFilterOnSelect} />)
      const input = container.querySelector('input')!

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'pe' } })

      await waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(4))

      fireEvent.click(container.querySelectorAll('li')[0])
      fireEvent.blur(input)

      expect(container.querySelectorAll('li')).toHaveLength(0)
      expect(input.value).toEqual('')
      await flush()
    }
  )

  it('should clear the current filter and the input value after an item is selected if clearFilterOnSelect is true', async () => {
    const { container } = render(<ComboboxTest clearFilterOnSelect={true} />)
    const input = container.querySelector('input')!

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'pe' } })

    await waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(4))

    fireEvent.click(container.querySelectorAll('li')[0])

    await waitFor(() => expect(input.value).toEqual(''))
    await waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(fruits.length))
    await flush()
  })

  it('should not clear the current filter and the input value after an item is selected if clearFilterOnSelect is false', async () => {
    const { container } = render(<ComboboxTest clearFilterOnSelect={false} />)
    const input = container.querySelector('input')!

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'pe' } })

    await waitFor(() => expect(container.querySelectorAll('li')).toHaveLength(4))

    fireEvent.click(container.querySelectorAll('li')[0])

    expect(container.querySelectorAll('li')).toHaveLength(4)
    expect(input.value).toEqual('pe')

    fireEvent.click(container.querySelectorAll('li')[1])

    expect(container.querySelectorAll('li')).toHaveLength(4)
    expect(input.value).toEqual('pe')
    await flush()
  })
})

describe('remove item', () => {
  it('should call onChange with the new value', async () => {
    const onChange = jest.fn()
    const { baseElement, findAllByTitle } = render(<ComboboxTest onChange={onChange} open />)

    const options = await waitForOptions(baseElement)

    //Selects first 2 items
    fireEvent.click(options[0])
    fireEvent.click(options[1])

    const removeFirstElementButton = (await findAllByTitle('Remove'))[0]
    fireEvent.click(removeFirstElementButton)

    expect(onChange).toHaveBeenLastCalledWith([fruits[1]])
    await flush()
  })

  it('should not focus nor toggle the menu opened state', async () => {
    const value = [fruits[0]]
    const { baseElement, findByTitle } = render(<ComboboxTest value={value} />)
    const input = baseElement.querySelector('input')

    expect(baseElement.querySelector('ul')).toBeFalsy()

    const removeFirstElementButton = await findByTitle('Remove')
    fireEvent.click(removeFirstElementButton)

    expect(baseElement.querySelector('ul')).toBeFalsy()
    expect(document.activeElement).not.toEqual(input)
    await flush()
  })
})

describe('controlled value', () => {
  // Keeps the value in state, as an application does. The guard turns a loop of changes into a failure instead of a
  // test that never ends
  function ControlledCombobox(props: { initialValue: Fruit[]; onChange?: (value: Fruit[]) => void }) {
    const [value, setValue] = useState(props.initialValue)
    const changes = useRef(0)
    const handleChange = (newValue: Fruit[]) => {
      if (++changes.current > 20) {
        throw new Error('onChange called in a loop')
      }
      props.onChange?.(newValue)
      setValue(newValue)
    }

    return (
      <>
        <ComboboxTest value={value} onChange={handleChange} openOnFocus={false} />
        <button onClick={() => setValue([])}>Clear value</button>
      </>
    )
  }

  it('removes the last item with Backspace in the empty field', async () => {
    const onChange = jest.fn()
    const { baseElement, queryByTestId } = render(
      <ControlledCombobox initialValue={[fruits[0], fruits[1]]} onChange={onChange} />
    )
    await flush()

    fireEvent.keyDown(baseElement.querySelector('input'), { key: 'Backspace' })
    await flush()

    expect(onChange).toHaveBeenLastCalledWith([fruits[0]])
    expect(queryByTestId('Apple')).toBeTruthy()
    expect(queryByTestId('Avocado')).toBeNull()
  })

  it('adds a picked option and removes an item by its button', async () => {
    const onChange = jest.fn()
    const { baseElement, findAllByTitle, queryByTestId } = render(
      <ControlledCombobox initialValue={[fruits[0]]} onChange={onChange} />
    )
    await flush()

    fireEvent.click(baseElement.querySelector(`#${TOGGLE_BUTTON_ID}`))
    const options = await waitForOptions(baseElement)
    fireEvent.click(options[2])
    await flush()
    expect(onChange).toHaveBeenLastCalledWith([fruits[0], fruits[2]])
    expect(queryByTestId('Banana')).toBeTruthy()

    fireEvent.click((await findAllByTitle('Remove'))[0])
    await flush()
    expect(onChange).toHaveBeenLastCalledWith([fruits[2]])
    expect(queryByTestId('Apple')).toBeNull()
    expect(queryByTestId('Banana')).toBeTruthy()
  })

  it('shows the items of a new value, including an empty one', async () => {
    const { getByText, queryByTestId } = render(<ControlledCombobox initialValue={[fruits[0]]} />)
    await flush()
    expect(queryByTestId('Apple')).toBeTruthy()

    fireEvent.click(getByText('Clear value'))
    await flush()
    expect(queryByTestId('Apple')).toBeNull()
  })
})

it('tells screen readers which options are checked', async () => {
  const { baseElement } = render(<ComboboxTest open />)
  const options = await waitForOptions(baseElement)

  fireEvent.click(options[1])
  await flush()

  const updatedOptions = baseElement.querySelectorAll('[role="option"]')
  expect(updatedOptions[0]).toHaveAttribute('aria-checked', 'false')
  expect(updatedOptions[1]).toHaveAttribute('aria-checked', 'true')
  expect(baseElement.querySelector('[role="listbox"]')).toHaveAttribute('aria-multiselectable', 'true')
  expect(updatedOptions[1].querySelector('input').closest('[aria-hidden="true"]')).toBeTruthy()
})
