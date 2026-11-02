import React, { CSSProperties } from 'react'

import { useStyles } from '../../styles'
import { ChartTooltip } from './ChartTooltip'
import { CustomDot } from './CustomDot'
import { AxisDomain, DotShape, SeriesType, TooltipRenderer } from './model'
import { getOutlierSeriesName } from './util'
import { SeriesLabel } from './SeriesLabel'

export interface LineDotProps<XDomain> {
  cx?: number
  cy?: number
  value?: number | number[]
  stroke?: string
  showTooltip?: boolean
  dataKey?: string
  payload?: { [x: string]: any }
  color?: string
  xDomain?: AxisDomain
  dotShape?: DotShape
  tooltipRenderer?: TooltipRenderer<XDomain>
}

export function LineDot<XDomain>(props: LineDotProps<XDomain>) {
  const {
    cx,
    cy,
    showTooltip,
    stroke,
    payload,
    value,
    xDomain,
    dataKey: seriesName,
    color,
    dotShape,
    tooltipRenderer,
  } = props
  const { classes } = useStyles(createStyles)
  // A dot of a stacked area gets [base, top] as its value, so the label takes the value of the series from the data row
  const labelValue =
    payload?.[getOutlierSeriesName(seriesName)]?.value ??
    payload?.[seriesName] ??
    (Array.isArray(value) ? value[value.length - 1] : value)

  const hideDot = payload?.['hideDot'] ?? false
  const outlierValue = payload?.[getOutlierSeriesName(seriesName)]

  return !hideDot ? (
    <>
      <SeriesLabel
        outlierValue={outlierValue}
        seriesType={SeriesType.Line}
        color={color}
        x={cx}
        y={cy}
        value={labelValue}
      />
      <ChartTooltip
        showTooltip={showTooltip}
        seriesName={seriesName}
        label={payload.x}
        value={labelValue}
        labelDomain={xDomain}
        renderer={tooltipRenderer}
      >
        <g className={classes.container}>
          <CustomDot cx={cx} cy={cy} stroke={stroke} shape={dotShape} />
        </g>
      </ChartTooltip>
    </>
  ) : null
}

const createStyles = () => ({
  container: {
    '.hover-shape': {
      visibility: 'hidden',
    },
    '&:hover .hover-shape': {
      visibility: 'visible',
    },
  } as CSSProperties,
})
