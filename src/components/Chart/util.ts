import { AxisDomain, DataPoint, isDateRange, isValueRange, ChartSeriesDataPoint } from './model'
import { TickProps } from './Tick'

export function getDataPointValue(dp: number | DataPoint<any>): number {
  if (typeof dp === 'number') return dp
  else return dp.y
}

export function isInsideDomain(value: any, domain: AxisDomain) {
  if (Array.isArray(domain)) return domain.includes(value)
  else return +value >= +domain.init && +value <= +domain.end
}
// Without a domain, the range areas take the whole axis
export const getAxisDomainInit = (x: AxisDomain): number | string =>
  !x ? undefined : isValueRange(x) || isDateRange(x) ? +x.init : x.length && x[0]

export const getAxisDomainEnd = (x: AxisDomain, hasOutliers?: boolean): number | string => {
  if (!x) return undefined

  if (isValueRange(x) || isDateRange(x)) {
    const end = Number(x.end)
    return hasOutliers ? end + getOutlierStepFromDomain(x) : end
  }

  return x.length && x[x.length - 1]
}

export const defaultChartDateFormatter = (date: Date) => date.toLocaleDateString()

// A range without step has a step of 1, as its ticks do
const getDomainNumericStep = (domain: AxisDomain): number =>
  !domain || Array.isArray(domain) ? null : isValueRange(domain) ? domain.step ?? 1 : domain.step?.amount ?? 1

export const getDomainMaxValue = (domain: AxisDomain): number | Date =>
  !domain || Array.isArray(domain) ? null : domain.end

export function isOutlier<XDomain>(
  value: ChartSeriesDataPoint<XDomain>,
  max?: number | Date,
  min?: number | Date
): boolean {
  return max && getDataPointValue(value) > +max && (!min || getDataPointValue(value) < +min)
}

export const getOutlierStep = (tickStep: number): number => (tickStep < 15 ? tickStep : Math.floor(tickStep / 3))

export const getOutlierStepFromDomain = (domain: AxisDomain): number => getOutlierStep(getDomainNumericStep(domain))

export const getOutlierSeriesName = (seriesName: string): string => `outliers${seriesName}`

export const convertTickProps = (props: any): Omit<TickProps, 'isOutlierIndicator' | 'domainMaxValue' | 'isAxisX'> => ({
  fill: props.fill,
  height: props.height,
  payload: props.payload,
  stroke: props.stroke,
  textAnchor: props.textAnchor,
  width: props.width,
  x: props.x,
  y: props.y,
})
