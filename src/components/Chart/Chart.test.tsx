import { act, createEvent, fireEvent, render, RenderResult } from '@testing-library/react'
import React from 'react'

import { BarChart } from './BarChart'
import { Chart, ChartProps } from './Chart'
import { SeriesType } from './model'

// Lets pending updates, such as popper positions, settle inside act
const flush = () => act(async () => undefined)

async function actRender(ui: React.ReactElement) {
  let renderResult!: RenderResult
  await act(async () => {
    renderResult = render(ui)
  })
  return renderResult
}

const tooltip = () => document.body.querySelector('[role="tooltip"]')

// Rests the pointer on a column or bar for the delay before its tooltip opens. The timers are fake only meanwhile,
// and the ones the tooltip starts run out before the real ones come back.
const hoverBar = async (bar: Element) => {
  jest.useFakeTimers()
  try {
    fireEvent.pointerOver(bar)
    await act(async () => {
      jest.advanceTimersByTime(400)
    })
    act(() => {
      jest.runOnlyPendingTimers()
    })
  } finally {
    jest.useRealTimers()
  }
}

// Moves the pointer over the middle of the chart, which opens its line tooltip. Recharts reads the position from
// pageX and pageY, which jsdom does not set.
const hoverChart = (container: HTMLElement) => {
  const wrapper = container.querySelector('.recharts-wrapper')
  const event = createEvent.mouseMove(wrapper)
  Object.defineProperties(event, { pageX: { value: 200 }, pageY: { value: 150 } })
  fireEvent(wrapper, event)
}

const lineTooltipLines = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.recharts-tooltip-wrapper p')).map((p) => p.textContent.trim())

const barsOf = (container: HTMLElement, seriesIndex: number) =>
  Array.from(container.querySelectorAll('.recharts-bar')[seriesIndex].querySelectorAll('.recharts-rectangle'))

const ticksOf = (container: HTMLElement, axis: 'x' | 'y') =>
  Array.from(container.querySelectorAll(`.recharts-${axis}Axis .recharts-cartesian-axis-tick text`)).map(
    (t) => t.textContent
  )

const ChartTest = (props: Partial<ChartProps<any>>) => (
  <Chart
    width={400}
    height={300}
    series={[{ name: 'A', data: [10] }]}
    xAxis={{ domain: ['Jan'] }}
    yAxis={{ domain: { init: 0, end: 40, step: 10 } }}
    {...props}
  />
)

describe('Chart', () => {
  describe('column tooltip', () => {
    it('should open when the pointer is over the column', async () => {
      const { container } = await actRender(<ChartTest type={SeriesType.Column} />)

      await hoverBar(barsOf(container, 0)[0])

      expect(tooltip()).toHaveTextContent('10 - Jan')
      await flush()
    })

    it('should open at once, without the delay of other tooltips, as the value is what the pointer is after', async () => {
      const { container } = await actRender(<ChartTest type={SeriesType.Column} />)
      // A tooltip that closed less than 300ms ago, as the one of the test before, would open this one at once anyway
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 350))
      })

      jest.useFakeTimers()
      try {
        fireEvent.pointerOver(barsOf(container, 0)[0])
        await act(async () => {
          jest.advanceTimersByTime(50)
        })
        expect(tooltip()).toHaveTextContent('10 - Jan')
        act(() => {
          jest.runOnlyPendingTimers()
        })
      } finally {
        jest.useRealTimers()
      }
      await flush()
    })

    const stackedSeries = [
      { name: 'A', data: [10] },
      { name: 'B', data: [5] },
    ]

    it('should show the value of the stacked column', async () => {
      const { container } = await actRender(<ChartTest type={SeriesType.Column} stacked series={stackedSeries} />)

      await hoverBar(barsOf(container, 1)[0])

      expect(tooltip().textContent).toBe('5 - Jan')
      await flush()
    })

    it('should give the series name and value of the column to the renderer', async () => {
      const render$ = jest.fn((points: any[]) => `${points[0].seriesName}: ${points[0].y}`)
      const { container } = await actRender(
        <ChartTest
          type={SeriesType.Column}
          stacked
          series={stackedSeries}
          tooltip={{ type: 'point', render: render$ }}
        />
      )

      await hoverBar(barsOf(container, 1)[0])

      expect(tooltip().textContent).toBe('B: 5')
      await flush()
    })

    it('should show the real value of an outlier column', async () => {
      const { container } = await actRender(
        <ChartTest type={SeriesType.Column} outliers='auto' series={[{ name: 'A', data: [200] }]} />
      )

      await hoverBar(barsOf(container, 0)[0])

      expect(tooltip().textContent).toBe('200 - Jan')
      await flush()
    })
  })

  describe('stacked areas', () => {
    it('should label each dot with the value of its own series', () => {
      const { container } = render(
        <ChartTest
          type={SeriesType.Area}
          stacked
          series={[
            { name: 'A', data: [10] },
            { name: 'B', data: [5] },
          ]}
        />
      )
      const labels = Array.from(container.querySelectorAll('.recharts-area-dots text')).map((t) => t.textContent)

      expect(labels).toEqual(['10', '5'])
    })
  })

  describe('date axis', () => {
    it('should format the ticks with the domain format', () => {
      const { container } = render(
        <ChartTest
          series={[{ name: 'A', data: [{ x: new Date(Date.UTC(2020, 0, 2)), y: 1 }] }]}
          xAxis={{
            domain: {
              init: new Date(Date.UTC(2020, 0, 1)),
              end: new Date(Date.UTC(2020, 0, 3)),
              step: { amount: 1, unit: 'day' },
              format: (date) => date.toISOString().slice(0, 10),
            },
          }}
        />
      )

      expect(ticksOf(container, 'x')).toEqual(['2020-01-01', '2020-01-02', '2020-01-03'])
    })
  })

  describe('categories', () => {
    it('should keep the order of the domain', () => {
      const { container } = render(
        <ChartTest series={[{ name: 'A', data: [1, 2, 3] }]} xAxis={{ domain: ['Jan', 'Feb', 'Mar'] }} />
      )
      const ticks = Array.from(container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick text'))
      const byPosition = ticks.sort((a, b) => +a.getAttribute('x') - +b.getAttribute('x')).map((t) => t.textContent)

      expect(byPosition).toEqual(['Jan', 'Feb', 'Mar'])
    })
  })

  describe('line tooltip', () => {
    it('should list the series without the reference areas', () => {
      const renderer = jest.fn(() => 'Tooltip')
      const { container } = render(
        <ChartTest
          tooltip={{ type: 'line', render: renderer }}
          referenceAreas={[{ label: { name: 'Ref' }, area: [{ x: 'Jan', upperLimit: 20 }] }]}
        />
      )

      hoverChart(container)

      expect(renderer).toHaveBeenLastCalledWith([{ seriesName: 'A', x: 'Jan', y: 10 }])
    })

    it('should show the x value without an x title', () => {
      const { container } = render(<ChartTest tooltip={{ type: 'line' }} />)

      hoverChart(container)

      expect(lineTooltipLines(container)).toEqual(['A: 10', 'Jan'])
    })

    it('should list series of the same value', () => {
      const consoleError = jest.spyOn(console, 'error')
      const { container } = render(
        <ChartTest
          tooltip={{ type: 'line' }}
          series={[
            { name: 'A', data: [10] },
            { name: 'B', data: [10] },
          ]}
        />
      )

      hoverChart(container)

      expect(lineTooltipLines(container)).toEqual(['A: 10', 'B: 10', 'Jan'])
      expect(consoleError).not.toHaveBeenCalledWith(
        expect.stringContaining('Encountered two children with the same key'),
        expect.anything(),
        expect.anything()
      )
      consoleError.mockRestore()
    })
  })

  describe('optional axes', () => {
    it('should render without yAxis', () => {
      expect(() => render(<ChartTest yAxis={undefined} />)).not.toThrow()
    })

    it('should render range areas without a y domain', () => {
      expect(() =>
        render(<ChartTest yAxis={{ title: 'Y' }} rangeAreas={[{ name: 'Range', init: 'Jan', end: 'Jan' }]} />)
      ).not.toThrow()
    })

    it('should render without a y domain when there are reference areas', () => {
      expect(() =>
        render(
          <ChartTest
            yAxis={{ title: 'Y' }}
            referenceAreas={[{ label: { name: 'Ref' }, area: [{ x: 'Jan', upperLimit: 20 }] }]}
          />
        )
      ).not.toThrow()
    })
  })
})

describe('BarChart', () => {
  const BarChartTest = (props: any) => (
    <BarChart width={400} height={300} series={[{ name: 'A', data: [10] }]} yAxis={{ domain: ['Jan'] }} {...props} />
  )

  it('should render without xAxis', () => {
    expect(() => render(<BarChartTest />)).not.toThrow()
  })

  // With categories, the Bar of Recharts has no tooltip payload, so the y domain is a range
  it.each([undefined, { title: 'Value' }])('should open the line tooltip with xAxis %j', (xAxis) => {
    const { container } = render(
      <BarChartTest
        series={[{ name: 'A', data: [10, 20, 30] }]}
        yAxis={{ domain: { init: 0, end: 2, step: 1 } }}
        xAxis={xAxis}
        tooltip={{ type: 'line' }}
      />
    )

    expect(() => hoverChart(container)).not.toThrow()
    expect(lineTooltipLines(container)[0]).toMatch(/^A: \d+$/)
  })

  it('should open the tooltip of a bar when the pointer is over it', async () => {
    const { container } = await actRender(<BarChartTest xAxis={{ domain: { init: 0, end: 40, step: 10 } }} />)

    await hoverBar(barsOf(container, 0)[0])

    expect(tooltip()).toHaveTextContent('10 - Jan')
    await flush()
  })
})
