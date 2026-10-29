import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { Slider } from './Slider'

jest.mock('../../util/string')

// jsdom has no PointerEvent, so the events would lose their coordinates and buttons
if (!(window as any).PointerEvent) {
  ;(window as any).PointerEvent = function PointerEvent(type: string, init: any = {}) {
    const event = new MouseEvent(type, init)
    Object.defineProperty(event, 'pointerId', { value: init.pointerId ?? 1 })
    return event
  }
}

const mockTrack = (slider: HTMLElement) => {
  const track = slider.parentElement
  track.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 4, right: 200, bottom: 4 } as DOMRect)
  return track.parentElement
}

describe('Slider', () => {
  it('should render correctly', () => {
    const { container } = render(<Slider label='Volume' defaultValue={40} showLimits />)
    expect(container).toMatchSnapshot()
  })

  it('should render a range correctly', () => {
    const { container } = render(<Slider label='Price' defaultValue={[20, 80]} />)
    expect(container).toMatchSnapshot()
  })

  it('should describe the value to screen readers', () => {
    const { getByRole } = render(<Slider label='Volume' defaultValue={40} min={10} max={90} />)
    const slider = getByRole('slider', { name: 'Volume' })

    expect(slider).toHaveAttribute('aria-valuenow', '40')
    expect(slider).toHaveAttribute('aria-valuemin', '10')
    expect(slider).toHaveAttribute('aria-valuemax', '90')
    expect(slider).toHaveAttribute('aria-orientation', 'horizontal')
    expect(slider).toHaveAttribute('tabindex', '0')
  })

  it('should start at the minimum without a value', () => {
    const { getByRole } = render(<Slider aria-label='Volume' min={5} />)
    expect(getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '5')
  })

  it('should change the value with the keyboard', () => {
    const onChange = jest.fn()
    const onChangeEnd = jest.fn()
    const { getByRole } = render(
      <Slider label='Volume' defaultValue={50} onChange={onChange} onChangeEnd={onChangeEnd} />
    )
    const slider = getByRole('slider')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '51')
    expect(onChange).toHaveBeenLastCalledWith(51)
    expect(onChangeEnd).toHaveBeenLastCalledWith(51)

    fireEvent.keyDown(slider, { key: 'ArrowDown' })
    expect(slider).toHaveAttribute('aria-valuenow', '50')

    fireEvent.keyDown(slider, { key: 'PageUp' })
    expect(slider).toHaveAttribute('aria-valuenow', '60')

    fireEvent.keyDown(slider, { key: 'PageDown' })
    expect(slider).toHaveAttribute('aria-valuenow', '50')

    fireEvent.keyDown(slider, { key: 'End' })
    expect(slider).toHaveAttribute('aria-valuenow', '100')

    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(slider).toHaveAttribute('aria-valuenow', '100')
    expect(onChangeEnd).toHaveBeenCalledTimes(5)

    fireEvent.keyDown(slider, { key: 'Home' })
    expect(slider).toHaveAttribute('aria-valuenow', '0')
    expect(onChange).toHaveBeenCalledTimes(6)
  })

  it('should keep decimal steps exact', () => {
    const { getByRole } = render(<Slider aria-label='Opacity' defaultValue={0.2} min={0} max={1} step={0.1} />)
    const slider = getByRole('slider')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '0.3')
  })

  it('should format the value on the screen and for screen readers', () => {
    const { getByRole, getByText } = render(
      <Slider label='Discount' defaultValue={15} formatValue={(v) => `${v}%`} showLimits />
    )
    expect(getByRole('slider')).toHaveAttribute('aria-valuetext', '15%')
    expect(getByText('15%')).toBeInTheDocument()
    expect(getByText('100%')).toBeInTheDocument()
  })

  it('should name the two thumbs of a range and keep them from crossing', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Slider label='Price' defaultValue={[20, 30]} step={10} onChange={onChange} />)
    const start = getByRole('slider', { name: 'Price Minimum' })
    const end = getByRole('slider', { name: 'Price Maximum' })

    expect(start).toHaveAttribute('aria-valuemax', '30')
    expect(end).toHaveAttribute('aria-valuemin', '20')

    fireEvent.keyDown(start, { key: 'ArrowRight' })
    expect(start).toHaveAttribute('aria-valuenow', '30')
    expect(onChange).toHaveBeenLastCalledWith([30, 30])

    fireEvent.keyDown(start, { key: 'End' })
    expect(start).toHaveAttribute('aria-valuenow', '30')

    fireEvent.keyDown(end, { key: 'Home' })
    expect(end).toHaveAttribute('aria-valuenow', '30')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should use aria-label and custom thumb labels', () => {
    const { getByRole } = render(<Slider aria-label='Age' defaultValue={[18, 65]} thumbLabels={['From', 'To']} />)
    expect(getByRole('slider', { name: 'Age From' })).toBeInTheDocument()
    expect(getByRole('slider', { name: 'Age To' })).toBeInTheDocument()
  })

  it('should follow the value of a controlled slider', () => {
    const Controlled = () => {
      const [value, setValue] = useState<[number, number]>([10, 90])
      return (
        <>
          <Slider label='Range' value={value} onChange={setValue} />
          <output>{value.join('-')}</output>
        </>
      )
    }
    const { getByRole, getByText } = render(<Controlled />)

    fireEvent.keyDown(getByRole('slider', { name: 'Range Maximum' }), { key: 'ArrowLeft' })
    expect(getByText('10-89')).toBeInTheDocument()
  })

  it('should not change a controlled slider by itself', () => {
    const { getByRole } = render(<Slider aria-label='Volume' value={50} />)
    fireEvent.keyDown(getByRole('slider'), { key: 'ArrowRight' })
    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '50')
  })

  it('should move the thumb with a pointer', () => {
    const onChange = jest.fn()
    const onChangeEnd = jest.fn()
    const { getByRole } = render(<Slider aria-label='Volume' onChange={onChange} onChangeEnd={onChangeEnd} />)
    const slider = getByRole('slider')
    const control = mockTrack(slider)

    fireEvent.pointerDown(control, { clientX: 150, button: 0 })
    expect(slider).toHaveAttribute('aria-valuenow', '75')
    expect(slider).toHaveFocus()

    fireEvent.pointerMove(control, { clientX: 50 })
    expect(slider).toHaveAttribute('aria-valuenow', '25')

    fireEvent.pointerMove(control, { clientX: 500 })
    expect(slider).toHaveAttribute('aria-valuenow', '100')
    expect(onChangeEnd).not.toHaveBeenCalled()

    fireEvent.pointerUp(control, { clientX: 500 })
    expect(onChangeEnd).toHaveBeenCalledWith(100)
    expect(onChange).toHaveBeenCalledTimes(3)

    fireEvent.pointerMove(control, { clientX: 0 })
    expect(slider).toHaveAttribute('aria-valuenow', '100')

    fireEvent.pointerDown(control, { clientX: 200, button: 0 })
    fireEvent.pointerUp(control, { clientX: 200 })
    expect(onChangeEnd).toHaveBeenCalledTimes(1)
  })

  it('should move the closest thumb of a range', () => {
    const { getByRole } = render(<Slider label='Price' defaultValue={[20, 80]} />)
    const start = getByRole('slider', { name: 'Price Minimum' })
    const end = getByRole('slider', { name: 'Price Maximum' })
    const control = mockTrack(start)

    fireEvent.pointerDown(control, { clientX: 120, button: 0 })
    fireEvent.pointerUp(control)
    expect(end).toHaveAttribute('aria-valuenow', '60')
    expect(start).toHaveAttribute('aria-valuenow', '20')

    fireEvent.pointerDown(control, { clientX: 20, button: 0 })
    fireEvent.pointerUp(control)
    expect(start).toHaveAttribute('aria-valuenow', '10')
  })

  it('should pick the thumb by the direction of the drag when both are on the same spot', () => {
    const { getByRole } = render(<Slider label='Price' defaultValue={[50, 50]} />)
    const start = getByRole('slider', { name: 'Price Minimum' })
    const end = getByRole('slider', { name: 'Price Maximum' })
    const control = mockTrack(start)

    fireEvent.pointerDown(control, { clientX: 100, button: 0 })
    fireEvent.pointerMove(control, { clientX: 60 })
    fireEvent.pointerUp(control)

    expect(start).toHaveAttribute('aria-valuenow', '30')
    expect(end).toHaveAttribute('aria-valuenow', '50')
  })

  it('should ignore the user when disabled', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Slider aria-label='Volume' defaultValue={50} disabled onChange={onChange} />)
    const slider = getByRole('slider')
    const control = mockTrack(slider)

    expect(slider).not.toHaveAttribute('tabindex')
    expect(slider).toHaveAttribute('aria-disabled', 'true')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    fireEvent.pointerDown(control, { clientX: 10, button: 0 })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should send the value with a form', () => {
    const { container } = render(<Slider aria-label='Price' name='price' defaultValue={[20, 80]} />)
    const inputs = container.querySelectorAll('input[type="hidden"]')

    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveAttribute('name', 'price')
    expect(inputs[0]).toHaveValue('20')
    expect(inputs[1]).toHaveValue('80')
  })

  it('should show the error and link it to the slider', () => {
    const { getByRole } = render(<Slider label='Volume' error='Pick a value above 10' />)
    const slider = getByRole('slider')

    expect(slider).toHaveAttribute('aria-invalid', 'true')
    expect(getByRole('alert')).toHaveTextContent('Pick a value above 10')
    expect(slider.getAttribute('aria-describedby')).toBe(getByRole('alert').id)
  })

  it('should focus the slider when the label is clicked', () => {
    const { getByRole, getByText } = render(<Slider label='Volume' />)
    fireEvent.click(getByText('Volume'))
    expect(getByRole('slider')).toHaveFocus()
  })
})
