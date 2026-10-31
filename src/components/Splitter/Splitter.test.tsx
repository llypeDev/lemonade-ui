import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { Splitter } from './Splitter'

jest.mock('../../util/string')

// jsdom has no PointerEvent, so the events would lose their coordinates and buttons
if (!(window as any).PointerEvent) {
  ;(window as any).PointerEvent = function PointerEvent(type: string, init: any = {}) {
    const event = new MouseEvent(type, init)
    Object.defineProperty(event, 'pointerId', { value: init.pointerId ?? 1 })
    return event
  }
}

const panels: [React.ReactNode, React.ReactNode] = [<p key='list'>Folders</p>, <p key='details'>Files</p>]

describe('Splitter', () => {
  it('should render correctly', () => {
    const { container } = render(<Splitter defaultSize={30}>{panels}</Splitter>)
    expect(container).toMatchSnapshot()
  })

  it('should describe the divider for screen readers', () => {
    const { getByRole } = render(<Splitter defaultSize={30}>{panels}</Splitter>)
    const separator = getByRole('separator', { name: 'Resize panels' })

    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    expect(separator).toHaveAttribute('aria-valuenow', '30')
    expect(separator).toHaveAttribute('aria-valuemin', '10')
    expect(separator).toHaveAttribute('aria-valuemax', '90')
    expect(document.getElementById(separator.getAttribute('aria-controls'))).toHaveTextContent('Folders')
  })

  it('should resize with the arrow keys, Home and End', () => {
    const onSizeChange = jest.fn()
    const { getByRole } = render(
      <Splitter defaultSize={30} onSizeChange={onSizeChange}>
        {panels}
      </Splitter>
    )
    const separator = getByRole('separator')

    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(separator).toHaveAttribute('aria-valuenow', '35')
    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    expect(separator).toHaveAttribute('aria-valuenow', '25')
    fireEvent.keyDown(separator, { key: 'End' })
    expect(separator).toHaveAttribute('aria-valuenow', '90')
    fireEvent.keyDown(separator, { key: 'Home' })
    expect(separator).toHaveAttribute('aria-valuenow', '10')

    expect(onSizeChange.mock.calls.map(([size]) => size)).toEqual([35, 30, 25, 90, 10])
  })

  it('should use the up and down arrows when the panels are one above the other', () => {
    const { getByRole } = render(
      <Splitter direction='vertical' defaultSize={50}>
        {panels}
      </Splitter>
    )
    const separator = getByRole('separator')

    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    fireEvent.keyDown(separator, { key: 'ArrowDown' })
    expect(separator).toHaveAttribute('aria-valuenow', '55')
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(separator).toHaveAttribute('aria-valuenow', '55')
    fireEvent.keyDown(separator, { key: 'ArrowUp' })
    expect(separator).toHaveAttribute('aria-valuenow', '50')
  })

  it('should collapse and restore the first panel with Enter', () => {
    const { getByRole } = render(
      <Splitter defaultSize={40} min={0}>
        {panels}
      </Splitter>
    )
    const separator = getByRole('separator')

    fireEvent.keyDown(separator, { key: 'Enter' })
    expect(separator).toHaveAttribute('aria-valuenow', '0')
    fireEvent.keyDown(separator, { key: 'Enter' })
    expect(separator).toHaveAttribute('aria-valuenow', '40')
  })

  it('should keep the size between min and max', () => {
    const { getByRole } = render(
      <Splitter defaultSize={25} min={20} max={60} step={10}>
        {panels}
      </Splitter>
    )
    const separator = getByRole('separator')

    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    expect(separator).toHaveAttribute('aria-valuenow', '20')
    for (let i = 0; i < 6; i++) {
      fireEvent.keyDown(separator, { key: 'ArrowRight' })
    }
    expect(separator).toHaveAttribute('aria-valuenow', '60')
  })

  it('should resize by dragging the divider', () => {
    const onSizeChange = jest.fn()
    const { getByRole, container } = render(<Splitter onSizeChange={onSizeChange}>{panels}</Splitter>)
    const root = container.firstChild as HTMLElement
    root.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 400, height: 300, right: 400, bottom: 300 } as DOMRect)
    const separator = getByRole('separator')

    fireEvent.pointerDown(separator, { button: 0, clientX: 200 })
    expect(separator).toHaveFocus()
    fireEvent.pointerMove(separator, { clientX: 100 })
    expect(separator).toHaveAttribute('aria-valuenow', '25')
    fireEvent.pointerMove(separator, { clientX: 10 })
    expect(separator).toHaveAttribute('aria-valuenow', '10')
    fireEvent.pointerUp(separator, { clientX: 10 })
    fireEvent.pointerMove(separator, { clientX: 300 })
    expect(separator).toHaveAttribute('aria-valuenow', '10')
    expect(onSizeChange).toHaveBeenLastCalledWith(10)
  })

  it('should follow the size of a controlled splitter', () => {
    const onSizeChange = jest.fn()
    const { getByRole, rerender } = render(
      <Splitter size={30} onSizeChange={onSizeChange}>
        {panels}
      </Splitter>
    )
    const separator = getByRole('separator')

    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(onSizeChange).toHaveBeenCalledWith(35)
    expect(separator).toHaveAttribute('aria-valuenow', '30')

    rerender(
      <Splitter size={70} onSizeChange={onSizeChange}>
        {panels}
      </Splitter>
    )
    expect(separator).toHaveAttribute('aria-valuenow', '70')
  })

  it('should accept a label and use the locale strings', () => {
    const { getByRole, rerender } = render(<Splitter label='Resize the folder list'>{panels}</Splitter>)
    expect(getByRole('separator', { name: 'Resize the folder list' })).toBeInTheDocument()

    rerender(
      <LocaleContext.Provider value={ptBR}>
        <Splitter>{panels}</Splitter>
      </LocaleContext.Provider>
    )
    expect(getByRole('separator', { name: 'Redimensionar painéis' })).toBeInTheDocument()
  })
})
