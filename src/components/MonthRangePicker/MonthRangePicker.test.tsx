import { fireEvent, render, waitFor, act } from '@testing-library/react'
import React from 'react'
import { DateRange } from '../DateRangePicker/BaseDateRangeInput'
import { MonthRangePicker, MonthRangePickerProps, ReferenceMonthRange } from './MonthRangePicker'

// Lets pending updates, such as popper positions and debounced loads, settle inside act
const flush = () => act(async () => undefined)

const createComponent = (props: Partial<MonthRangePickerProps> = {}) => (
  <MonthRangePicker
    value={{ start: undefined, end: undefined } as ReferenceMonthRange}
    monthPickerProps={{ visibleMonth: { month: 1, year: 2021 } }}
    {...props}
  />
)

const FIRST = 0
const SECOND = 1

describe('MonthRangePicker', () => {
  describe('render', () => {
    it('should render correctly', async () => {
      const { container } = render(
        createComponent({
          monthPickerProps: { visibleMonth: undefined },
        })
      )
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly when opened', async () => {
      const { container } = render(createComponent())
      fireEvent.focus(container.querySelector('input'))
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly when disabled', async () => {
      const { container } = render(createComponent({ disabled: true }))
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly when invalid', async () => {
      const { container } = render(createComponent({ invalid: true }))
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should call onFocus and onBlur when one of the inputs has and lose focus', async () => {
      const focus = jest.fn()
      const blur = jest.fn()
      const { container } = render(createComponent({ onBlur: blur, onFocus: focus }))
      const input = container.querySelectorAll('input')[0]
      fireEvent.focus(input)
      fireEvent.blur(input)

      await waitFor(() => jest.useFakeTimers())

      expect(focus).toHaveBeenCalledTimes(1)
      expect(blur).toHaveBeenCalledTimes(1)
      await flush()
    })

    it('should show month picker correctly when inputs are cleaned', async () => {
      const { container } = render(createComponent())
      fireEvent.focus(container.querySelector('input'))
      expect(container.querySelector('button[title="January"]')).toMatchSnapshot()
      await flush()
    })

    it('should show month picker correctly when only start month is defined and the first input is focused', async () => {
      const { container } = render(
        createComponent({
          value: {
            start: { month: 1, year: 2021 },
            end: undefined,
          },
        })
      )
      const inputs = container.querySelectorAll('input')

      fireEvent.focus(inputs[FIRST])
      expect(container.querySelector('button[title="January"]')).toMatchSnapshot()
      expect(container.querySelector('button[title="February"]')).toMatchSnapshot()
      await flush()
    })

    it('should show month picker correctly when only start month is defined and the second input is focused', async () => {
      const { container } = render(
        createComponent({
          value: {
            start: { month: 1, year: 2021 },
            end: undefined,
          },
        })
      )
      const inputs = container.querySelectorAll('input')

      fireEvent.focus(inputs[SECOND])
      expect(container.querySelector('button[title="January"]')).toMatchSnapshot()
      expect(container.querySelector('button[title="February"]')).toMatchSnapshot()
      await flush()
    })

    it('should show month picker correctly when only end month is defined and the first input is focused', async () => {
      const { container } = render(
        createComponent({
          value: {
            start: undefined,
            end: { month: 1, year: 2021 },
          },
        })
      )
      const inputs = container.querySelectorAll('input')

      fireEvent.focus(inputs[FIRST])
      expect(container.querySelector('button[title="January"]')).toMatchSnapshot()
      expect(container.querySelector('button[title="February"]')).toMatchSnapshot()
      await flush()
    })

    it('should show month picker correctly when only end month is defined and the second input is focused', async () => {
      const { container } = render(
        createComponent({
          value: {
            start: undefined,
            end: { month: 1, year: 2021 },
          },
        })
      )
      const inputs = container.querySelectorAll('input')

      fireEvent.focus(inputs[SECOND])
      expect(container.querySelector('button[title="January"]')).toMatchSnapshot()
      expect(container.querySelector('button[title="February"]')).toMatchSnapshot()
      await flush()
    })

    it('should show month picker correctly when start month e end month are defined and the first input is focused', async () => {
      const { container } = render(
        createComponent({
          value: {
            start: { month: 0, year: 2021 },
            end: { month: 3, year: 2021 },
          },
        })
      )
      const inputs = container.querySelectorAll('input')

      fireEvent.focus(inputs[FIRST])
      expect(container.querySelector('button[title="January"]')).toMatchSnapshot()
      expect(container.querySelector('button[title="February"]')).toMatchSnapshot()
      await flush()
    })

    it('should show month picker correctly when start month e end month are defined and the second input is focused', async () => {
      const { container } = render(
        createComponent({
          value: {
            start: { month: 0, year: 2021 },
            end: { month: 3, year: 2021 },
          },
        })
      )
      const inputs = container.querySelectorAll('input')

      fireEvent.focus(inputs[SECOND])
      expect(container.querySelector('button[title="January"]')).toMatchSnapshot()
      expect(container.querySelector('button[title="February"]')).toMatchSnapshot()
      await flush()
    })
  })
  describe('on change', () => {
    describe('typing on the inputs', () => {
      it('should call onChange when a month is typed in first input', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
            value: {
              start: undefined,
              end: { month: 2, year: 2021 },
            },
          })
        )
        const input = container.querySelectorAll('input')[FIRST]

        fireEvent.change(input, { target: { value: '01/2021' } })
        expect(change).toBeCalledWith({
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-03-31'),
        } as DateRange)
        await flush()
      })

      it('should call onChange when a month is typed in second input', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
          })
        )
        const input = container.querySelectorAll('input')[SECOND]

        fireEvent.change(input, { target: { value: '01/2021' } })
        expect(change).toBeCalledWith({
          startDate: undefined,
          endDate: new Date('2021-01-31'),
        } as DateRange)
        await flush()
      })
    })

    describe('clicking on month picker', () => {
      it('should call onChange with only the startDate when the first input is focused and an arbitrary month is selected ', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
          })
        )
        const input = container.querySelectorAll('input')[FIRST]

        fireEvent.focus(input)
        fireEvent.click(container.querySelector('button[title="January"]'))

        expect(change).toBeCalledWith({
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-01-31'),
        } as DateRange)
        await flush()
      })

      it('should call onChange with only the endDate when the second input is focused and an arbitrary month is selected ', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
          })
        )
        const input = container.querySelectorAll('input')[SECOND]

        fireEvent.focus(input)
        fireEvent.click(container.querySelector('button[title="January"]'))
        expect(change).toBeCalledWith({
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-01-31'),
        } as DateRange)
        await flush()
      })

      it('should call onChange with a new period when the first input is focused and the selected month is after the second input value', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
            value: {
              start: { month: 0, year: 2021 },
              end: { month: 1, year: 2021 },
            },
          })
        )
        const input = container.querySelectorAll('input')[FIRST]

        fireEvent.focus(input)
        fireEvent.click(container.querySelector('button[title="March"]'))
        expect(change).toBeCalledWith({
          startDate: new Date('2021-03-01'),
          endDate: new Date('2021-03-31'),
        } as DateRange)
        await flush()
      })

      it('should call onChange with a new period when the second input is focused and the selected month is before the first input value', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
            value: {
              start: { month: 1, year: 2021 },
              end: { month: 2, year: 2021 },
            },
          })
        )
        const input = container.querySelectorAll('input')[SECOND]

        fireEvent.focus(input)
        fireEvent.click(container.querySelector('button[title="January"]'))
        expect(change).toBeCalledWith({
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-01-31'),
        } as DateRange)
        await flush()
      })

      it('should call onChange with a new endDate when the second input is focused and the selected month is after the second input value', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
            value: {
              start: { month: 0, year: 2021 },
              end: { month: 2, year: 2021 },
            },
          })
        )
        const input = container.querySelectorAll('input')[SECOND]

        fireEvent.focus(input)
        fireEvent.click(container.querySelector('button[title="March"]'))
        expect(change).toBeCalledWith({
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-03-31'),
        } as DateRange)
        await flush()
      })

      it('should call onChange with a new startDate when the first input is focused and the selected month is before the first input value', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
            value: {
              start: { month: 1, year: 2021 },
              end: { month: 2, year: 2021 },
            },
          })
        )
        const input = container.querySelectorAll('input')[FIRST]

        fireEvent.focus(input)
        fireEvent.click(container.querySelector('button[title="January"]'))
        expect(change).toBeCalledWith({
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-03-31'),
        } as DateRange)
        await flush()
      })
    })

    describe('clearing the inputs', () => {
      it('should return the startDate as undefined when clear the first input', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
            value: {
              start: { month: 1, year: 2021 },
              end: { month: 2, year: 2021 },
            },
          })
        )
        const span = container.querySelectorAll('span[title="Clear"]')[FIRST]

        fireEvent.click(span)
        expect(change).toBeCalledWith({
          startDate: undefined,
          endDate: new Date(2021, 3, 0, 0, 0, 0, 0),
        } as DateRange)
        await flush()
      })

      it('should return the endDate as undefined when clear the second input', async () => {
        const change = jest.fn()
        const { container } = render(
          createComponent({
            onChange: change,
            value: {
              start: { month: 1, year: 2021 },
              end: { month: 2, year: 2021 },
            },
          })
        )
        const span = container.querySelectorAll('span[title="Clear"]')[SECOND]

        fireEvent.click(span)
        expect(change).toBeCalledWith({
          startDate: new Date(2021, 1, 1, 0, 0, 0, 0),
          endDate: undefined,
        } as DateRange)
        await flush()
      })
    })
  })
})
