import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { SortableList, SortableListProps } from './SortableList'

jest.mock('../../util/string')

// jsdom has no PointerEvent, so the events would lose their coordinates and buttons
if (!(window as any).PointerEvent) {
  ;(window as any).PointerEvent = function PointerEvent(type: string, init: any = {}) {
    const event = new MouseEvent(type, init)
    Object.defineProperty(event, 'pointerId', { value: init.pointerId ?? 1 })
    return event
  }
}

interface Task {
  id: number
  label: string
}

const tasks: Task[] = [
  { id: 1, label: 'Write the brief' },
  { id: 2, label: 'Review the layout' },
  { id: 3, label: 'Ship it' },
]

const Controlled = (props: Partial<SortableListProps<Task>> & { onOrder?(items: Task[]): void }) => {
  const { onOrder, ...rest } = props
  const [items, setItems] = useState(tasks)
  return (
    <SortableList
      aria-label='Tasks'
      items={items}
      onChange={(next) => {
        setItems(next)
        onOrder && onOrder(next)
      }}
      {...rest}
    />
  )
}

const texts = (container: HTMLElement) => Array.from(container.querySelectorAll('li')).map((li) => li.textContent)

describe('SortableList', () => {
  it('should render correctly', () => {
    const { container } = render(<SortableList aria-label='Tasks' items={tasks} onChange={jest.fn()} />)
    expect(container).toMatchSnapshot()
  })

  it('should name the handles and explain how to move', () => {
    const { getByRole } = render(<Controlled />)
    const handle = getByRole('button', { name: 'Move Review the layout' })

    expect(handle).toHaveAttribute('aria-pressed', 'false')
    expect(document.getElementById(handle.getAttribute('aria-describedby'))).toHaveTextContent(
      'Press Space to pick the item up'
    )
    expect(getByRole('list', { name: 'Tasks' })).toBeInTheDocument()
  })

  it('should move an item with the keyboard and announce each step', () => {
    const onOrder = jest.fn()
    const { container, getByRole } = render(<Controlled onOrder={onOrder} />)
    const handle = getByRole('button', { name: 'Move Write the brief' })
    const status = getByRole('status')

    handle.focus()
    fireEvent.keyDown(handle, { key: ' ' })
    expect(handle).toHaveAttribute('aria-pressed', 'true')
    expect(status).toHaveTextContent('Write the brief picked up. Position 1 of 3.')

    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    expect(status).toHaveTextContent('Write the brief moved to position 2 of 3.')
    expect(texts(container)).toEqual(['Review the layout', 'Write the brief', 'Ship it'])
    expect(handle).toHaveFocus()
    expect(onOrder).not.toHaveBeenCalled()

    fireEvent.keyDown(handle, { key: 'End' })
    fireEvent.keyDown(handle, { key: ' ' })
    expect(status).toHaveTextContent('Write the brief dropped at position 3 of 3.')
    expect(handle).toHaveAttribute('aria-pressed', 'false')
    expect(handle).toHaveFocus()
    expect(onOrder).toHaveBeenCalledTimes(1)
    expect(onOrder.mock.calls[0][0].map((task: Task) => task.id)).toEqual([2, 3, 1])
  })

  it('should put the item back with Escape', () => {
    const onOrder = jest.fn()
    const { container, getByRole } = render(<Controlled onOrder={onOrder} />)
    const handle = getByRole('button', { name: 'Move Ship it' })

    handle.focus()
    fireEvent.keyDown(handle, { key: 'Enter' })
    fireEvent.keyDown(handle, { key: 'Home' })
    expect(texts(container)).toEqual(['Ship it', 'Write the brief', 'Review the layout'])

    fireEvent.keyDown(handle, { key: 'Escape' })
    expect(texts(container)).toEqual(['Write the brief', 'Review the layout', 'Ship it'])
    expect(getByRole('status')).toHaveTextContent('Move cancelled. Ship it is back at position 3 of 3.')
    expect(handle).toHaveFocus()
    expect(onOrder).not.toHaveBeenCalled()
  })

  it('should not call onChange when the item is dropped where it was', () => {
    const onOrder = jest.fn()
    const { getByRole } = render(<Controlled onOrder={onOrder} />)
    const handle = getByRole('button', { name: 'Move Ship it' })

    fireEvent.keyDown(handle, { key: ' ' })
    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    fireEvent.keyDown(handle, { key: ' ' })
    expect(onOrder).not.toHaveBeenCalled()
  })

  it('should drop the item when the focus leaves its handle', () => {
    jest.useFakeTimers()
    const onOrder = jest.fn()
    const { getByRole } = render(
      <>
        <Controlled onOrder={onOrder} />
        <button>After</button>
      </>
    )
    const handle = getByRole('button', { name: 'Move Write the brief' })

    handle.focus()
    fireEvent.keyDown(handle, { key: ' ' })
    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    getByRole('button', { name: 'After' }).focus()
    act(() => {
      jest.runAllTimers()
    })

    expect(onOrder.mock.calls[0][0].map((task: Task) => task.id)).toEqual([2, 1, 3])
    expect(getByRole('button', { name: 'After' })).toHaveFocus()
    jest.useRealTimers()
  })

  it('should move an item by dragging its handle', () => {
    const onOrder = jest.fn()
    const { container, getByRole } = render(<Controlled onOrder={onOrder} />)
    container.querySelectorAll('li').forEach((li, index) => {
      li.getBoundingClientRect = () => ({ top: index * 50, height: 50, bottom: index * 50 + 50 } as DOMRect)
    })
    const handle = getByRole('button', { name: 'Move Write the brief' })

    fireEvent.pointerDown(handle, { button: 0, clientY: 25 })
    expect(handle).toHaveAttribute('aria-pressed', 'true')
    expect(handle).toHaveFocus()

    fireEvent.pointerMove(document, { clientY: 130 })
    expect(texts(container)).toEqual(['Review the layout', 'Ship it', 'Write the brief'])

    fireEvent.pointerUp(document, { clientY: 130 })
    expect(handle).toHaveAttribute('aria-pressed', 'false')
    expect(onOrder.mock.calls[0][0].map((task: Task) => task.id)).toEqual([2, 3, 1])
  })

  it('should work with a list of strings and a custom render', () => {
    const { getByRole, getByText } = render(
      <SortableList
        aria-label='Colors'
        items={['Red', 'Green']}
        onChange={jest.fn()}
        renderItem={(color, index) => `${index + 1}. ${color}`}
      />
    )
    expect(getByRole('button', { name: 'Move Green' })).toBeInTheDocument()
    expect(getByText('2. Green')).toBeInTheDocument()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Controlled />
      </LocaleContext.Provider>
    )
    const handle = getByRole('button', { name: 'Mover Ship it' })

    fireEvent.keyDown(handle, { key: ' ' })
    fireEvent.keyDown(handle, { key: 'ArrowUp' })
    expect(getByRole('status')).toHaveTextContent('Ship it movido para a posição 2 de 3.')
  })
})
