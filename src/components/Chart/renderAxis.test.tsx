import { render } from '@testing-library/react'
import React from 'react'

import { getDomainPoints } from './getDomainPoints'
import { DateRange } from './model'
import { renderAxis } from './renderAxis'

// The tick draws SVG elements, which React only knows inside an <svg>
const renderInSvg = (ui: React.ReactElement) =>
  render(ui, {
    container: document.body.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg')) as any,
  })

describe('renderAxis', () => {
  const dateDomain: DateRange = {
    init: new Date(Date.UTC(2020, 0, 1)),
    end: new Date(Date.UTC(2020, 0, 3)),
    step: { amount: 1, unit: 'day' },
    format: (date) => date.toISOString().slice(0, 10),
  }

  it('should format the ticks of a date axis', () => {
    const points = getDomainPoints<number>(dateDomain)
    const tick = renderAxis('x', {}, dateDomain, points, false).props.tick

    const { container } = renderInSvg(tick({ x: 0, y: 0, index: 1, payload: { value: points[1] } }))

    expect(container.textContent).toBe('2020-01-02')
  })

  it('should show the formatted domain end on the outlier tick of a date axis', () => {
    const points = getDomainPoints<number>(dateDomain, true)
    const tick = renderAxis('y', {}, dateDomain, points, true).props.tick

    const { container } = renderInSvg(
      tick({ x: 0, y: 0, index: points.length - 1, payload: { value: points[points.length - 1] } })
    )

    expect(container.textContent).toBe('>2020-01-03')
  })
})
