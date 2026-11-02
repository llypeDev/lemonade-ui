import { fireEvent, render, act } from '@testing-library/react'
import { resetIdCounter } from 'downshift'
import React from 'react'

import { DefaultItemType } from '../Select/SelectSingle'

import { SelectInline, SelectInlineProps } from './SelectInline'

// Lets pending updates, such as popper positions and debounced loads, settle inside act
const flush = () => act(async () => undefined)

const items: DefaultItemType[] = [
  { label: 'Value #001', value: 1 },
  { label: 'Value #002', value: 2 },
  { label: 'Value #003', value: 3 },
  { label: 'Value #004', value: 4 },
]

const itemToString = (item: DefaultItemType) => item && item.label

const SelectInlineTest = (props?: Partial<SelectInlineProps<DefaultItemType>>) => (
  <SelectInline<DefaultItemType>
    value={items[0]}
    items={items}
    itemToString={itemToString}
    defaultButtonText='SelectInline'
    placeholder='Search for a value'
    {...props}
  />
)

beforeEach(() => resetIdCounter())

describe('SelectInline', () => {
  it('should render correctly when closed', async () => {
    const { container } = render(<SelectInlineTest />)
    expect(container).toMatchSnapshot()
    await flush()
  })
  it('should render correctly when opened', async () => {
    const { container } = render(<SelectInlineTest />)
    const button = container.querySelector('button')
    fireEvent.click(button)
    expect(document.body).toMatchSnapshot()
    await flush()
  })
  it('should make the popper content visible on click', async () => {
    const { container } = render(<SelectInlineTest />)
    const button = container.querySelector('button')
    expect(container.querySelector('ul')).toBeFalsy()
    fireEvent.click(button)
    expect(container.querySelector('ul')).toBeTruthy()
    await flush()
  })

  it('should focus the input field when opened', async () => {
    const { container } = render(<SelectInlineTest />)
    fireEvent.click(container.querySelector('button'))
    expect(document.activeElement).toEqual(container.querySelector('input'))
    await flush()
  })
  it('should contain search input box', async () => {
    const { container } = render(<SelectInlineTest />)
    fireEvent.click(container.querySelector('button'))
    expect(container.querySelector('input')).not.toBeNull()
    await flush()
  })

  it('should tell whether the popup is open', async () => {
    const { container } = render(<SelectInlineTest />)
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await flush()
  })

  it('should close with Escape and give the focus back to the button', async () => {
    const onChange = jest.fn()
    const { container } = render(<SelectInlineTest onChange={onChange} />)
    const button = container.querySelector('button')
    fireEvent.click(button)
    await flush()

    fireEvent.keyDown(container.querySelector('input'), { key: 'Escape' })
    await flush()

    expect(container.querySelector('input')).toBeNull()
    expect(button).toHaveFocus()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should close on a click outside', async () => {
    const { container } = render(<SelectInlineTest />)
    fireEvent.click(container.querySelector('button'))
    await flush()

    fireEvent.mouseDown(document.body)
    await flush()

    expect(container.querySelector('input')).toBeNull()
  })

  it('should give the focus back to the button after a pick', async () => {
    const onChange = jest.fn()
    const { container, getByText } = render(<SelectInlineTest onChange={onChange} />)
    const button = container.querySelector('button')
    fireEvent.click(button)
    await flush()

    fireEvent.click(getByText(items[2].label))
    await flush()

    expect(onChange).toHaveBeenCalledWith(items[2], expect.anything())
    expect(container.querySelector('input')).toBeNull()
    expect(button).toHaveFocus()
  })

  it('should tell the placement of the popup', async () => {
    const { container } = render(<SelectInlineTest />)
    fireEvent.click(container.querySelector('button'))
    await flush()

    expect(container.querySelector('[data-placement]')).toHaveAttribute('data-placement', 'bottom')
  })
})
