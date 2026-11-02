import { dateRangeStepToMillis } from './dateRangeStepToMillis'
import { AxisDomain, DateRange, DateRangeStep, isValueRange, ValueRange } from './model'
import { getOutlierStep } from './util'

export function getDomainPoints<XDomain>(domain: AxisDomain, hasOutliers: boolean = false): XDomain[] {
  if (!domain || Array.isArray(domain)) return domain as any[]
  if (isValueRange(domain)) return getValueRangeDomainPoints(domain, hasOutliers)
  else return getDateRangeDomainPoints(domain, hasOutliers)
}

const countDecimals = (value: number): number => {
  const [mantissa, exponent] = String(value).split('e')
  return Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - +(exponent ?? 0))
}

function getValueRangeDomainPoints(domain: ValueRange, hasOutliers: boolean): any[] {
  const points = []
  const step = domain.step ?? 1
  // Each point is taken from init and rounded to the decimals of init and step, so the float errors of a decimal
  // step, such as 0.1 + 0.2 = 0.30000000000000004, do not add up
  const decimals = Math.max(countDecimals(domain.init), countDecimals(step))
  const pointAt = (index: number) => +(domain.init + index * step).toFixed(decimals)
  for (let i = 0; pointAt(i) <= domain.end; i++) points.push(pointAt(i))
  if (!points.includes(domain.end)) points.push(domain.end)
  if (hasOutliers) points.push(domain.end + getOutlierStep(step))
  return points
}

function getDateRangeDomainPoints(domain: DateRange, hasOutliers: boolean = false): any[] {
  const points = []
  const step = domain.step ?? { amount: 1, unit: 'day' }
  const endMillis = +domain.end
  let currValue = +domain.init
  do {
    points.push(currValue.valueOf())
    currValue = addStepToDate(currValue, step)
  } while (currValue < endMillis)
  if (!points.includes(endMillis)) points.push(domain.end.valueOf())
  if (hasOutliers) {
    const outlierStepAmount = getOutlierStep(step.amount)
    const outlierDate = addStepToDate(+domain.end, { amount: outlierStepAmount, unit: step.unit })
    points.push(outlierDate)
  }

  return points
}

function addStepToDate(dateMillis: number, step: DateRangeStep): number {
  switch (step.unit) {
    case 'year':
      const newDateY = new Date(dateMillis)
      newDateY.setFullYear(newDateY.getFullYear() + step.amount)
      return +newDateY
    case 'month':
      const newDateM = new Date(dateMillis)
      newDateM.setMonth(newDateM.getMonth() + step.amount)
      return +newDateM
    default:
      return dateMillis + dateRangeStepToMillis(step)
  }
}
