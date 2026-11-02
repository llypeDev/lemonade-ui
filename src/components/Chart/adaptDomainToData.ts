import { dateRangeStepToMillis } from './dateRangeStepToMillis'
import { AxisDomain, ChartSeries, DateRange, isValueRange, ValueRange } from './model'
import { getDataPointValue } from './util'

const EXCEPTION_DOMAIN_MESSAGE = 'Domain init must be less than domain end'

export function adaptDomainToSeriesRange<XDomain>(
  domain: AxisDomain,
  series: ChartSeries<XDomain>[],
  hasOutlier?: boolean
): AxisDomain {
  const dataValues = series.flatMap((s) => (s.data as []).map((d) => getDataPointValue(d)))
  return adaptDomainToDataRange(domain, dataValues, hasOutlier)
}

export function adaptDomainToDataRange(
  domain: AxisDomain,
  dataValues: number[] | Date[] | string[],
  hasOutlier?: boolean
): AxisDomain {
  if (!domain || !dataValues) return domain
  if (Array.isArray(domain)) return dataValues as string[]

  const numericDataValues = (dataValues as []).map((d) => +d).filter((d) => !isNaN(d))
  if (!numericDataValues.length) return domain

  if (isValueRange(domain)) return adaptValueRangeDomainToData(domain, numericDataValues, hasOutlier)
  else return adaptDateRangeDomainToData(domain, numericDataValues, hasOutlier)
}

function adaptValueRangeDomainToData(domain: ValueRange, dataValues: number[], hasOutlier: boolean): ValueRange {
  if (domain.init >= domain.end) throw Error(EXCEPTION_DOMAIN_MESSAGE)

  const dataMin = Math.min(...dataValues)
  const dataMax = Math.max(...dataValues)
  // The ticks of a domain without step are 1 apart, and the floor rounds negative values down, unlike %
  const step = domain.step ?? 1

  return {
    init: dataMin < domain.init ? Math.floor(dataMin / step) * step : domain.init,
    end: dataMax > domain.end && !hasOutlier ? Math.floor(dataMax / step) * step + step : domain.end,
    step: domain.step,
  }
}

function adaptDateRangeDomainToData(domain: DateRange, dataValues: number[], hasOutlier: boolean): DateRange {
  if (+domain.init >= +domain.end) throw Error(EXCEPTION_DOMAIN_MESSAGE)

  const valueDomain = adaptValueRangeDomainToData(
    {
      init: +domain.init,
      end: +domain.end,
      // The ticks of a domain without step are a day apart
      step: dateRangeStepToMillis(domain.step ?? { amount: 1, unit: 'day' }),
    },
    dataValues,
    hasOutlier
  )

  return {
    init: new Date(valueDomain.init),
    end: new Date(valueDomain.end),
    step: domain.step,
  }
}
