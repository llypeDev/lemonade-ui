import createMonotoneCubicInterpolator from './createMonotoneCubicInterpolator'
import { AxisDomain, ChartSeries, ChartSeriesDataPoint, DataPoint, RangeArea, ReferenceAreaWithPercents } from './model'
import { getDataPointValue, getOutlierSeriesName, getDomainMaxValue, getOutlierStepFromDomain } from './util'

export function convertSeries<XDomain>(
  series: ChartSeries<XDomain>[],
  domainPoints: XDomain[],
  adaptedYDomain: AxisDomain,
  refsAreas?: ReferenceAreaWithPercents<XDomain>[],
  outlierSeries?: ChartSeries<XDomain>[],
  hiddenRanges?: RangeArea<XDomain>[],
  yAtEndRanges?: RangeArea<XDomain>[]
): any[] {
  const outlierTickValue = getOutlierTickValue(adaptedYDomain)

  const refs = (refsAreas ?? []).flatMap((refsAreas) => {
    return refsAreas.areaPercents.map((data, i) => {
      return {
        x: data.x,
        [refsAreas.label.name]: data.percent,
      }
    })
  })

  const addTick = (x: XDomain): XDomain => {
    if (typeof x === 'number') return ((x + 1) as unknown) as XDomain
    if (x instanceof Date) return (new Date(x.getTime() + 1) as unknown) as XDomain
    if (typeof x === 'object' && x !== null) return ((+x + 1) as unknown) as XDomain
    return x
  }

  const isHidden = (x: XDomain): boolean => {
    if (!hiddenRanges || !hiddenRanges.length) return false

    const isStringDomain = typeof x === 'string'

    const isHiddenHandler = isStringDomain
      ? (r: RangeArea<XDomain>) => {
          const iX = domainPoints.indexOf(x)
          const iInit = domainPoints.indexOf(r.mask?.hideDots?.from ?? r.init)
          const iEnd = domainPoints.indexOf(r.mask?.hideDots?.to ?? r.end)
          return iX >= iInit && iX < iEnd
        }
      : (r: RangeArea<XDomain>) => +(r.mask?.hideDots.from ?? r.init) <= +x && +x <= +(r.mask?.hideDots?.to ?? r.end)

    return hiddenRanges?.some(isHiddenHandler) ?? false
  }

  // Categories keep the order of the domain, and numbers and dates go in ascending order
  const position = (x: XDomain): number => {
    const value = typeof x === 'string' ? domainPoints?.indexOf(x) ?? -1 : +x
    return isNaN(value) || value === -1 ? Infinity : value
  }
  const byPosition = (a: { x: XDomain }, b: { x: XDomain }) => {
    const [positionA, positionB] = [position(a.x), position(b.x)]
    return positionA === positionB ? 0 : positionA > positionB ? 1 : -1
  }

  // Points of the same date share a row, though they are different Date objects
  const rowKey = (x: XDomain) => (x instanceof Date ? +x : x)

  const data = (series ?? [])
    .flatMap((serie, serieIndex) => {
      return (serie.data as any[]).map((data: ChartSeriesDataPoint<XDomain>, dataIndex: number) => {
        const hasOutliers = outlierSeries && seriesHasOutliers(outlierSeries, serieIndex, dataIndex)
        const x = (data as DataPoint<XDomain>).x ?? domainPoints[dataIndex]

        const value = !isHidden(x)
          ? hasOutliers
            ? getOutlierSeriesConfig(serie.name, data, outlierTickValue)
            : { [serie.name]: getDataPointValue(data) }
          : {}

        return {
          x: (data as DataPoint<XDomain>).x ?? domainPoints[dataIndex],
          ...value,
        }
      })
    })
    .concat(...refs)
    .concat(
      ...(yAtEndRanges ?? []).map((r) => ({
        x: addTick(r.end),
        hideDot: true,
        ...series.reduce((acc, serie) => {
          acc[serie.name] = r.mask!.yAtEnd
          return acc
        }, {} as Record<string, XDomain>),
      }))
    )
    .sort(byPosition)
    .reduce((map, obj) => {
      map.set(rowKey(obj.x), { ...map.get(rowKey(obj.x)), ...obj })
      return map
    }, new Map())

  /*
   * The values must be interpolated because Recharts considers empty values as 0
   * and the reference area crashes when there are X or Y points without a corresponding
   * reference area point.
   */
  const refValueNames = new Set(refs.flatMap((v) => Object.keys(v)))
  return interpolateValues(Array.from(data.values()), refValueNames)
}

const asNumber = (x: any) => (isNaN(+x) ? null : +x)

function interpolateValues(orderedValues: any[], valueNames: Set<string>): any[] {
  valueNames.delete('x')
  const interpolators = getValuesInterpolators(orderedValues, valueNames)

  return orderedValues.map((v, i) => {
    valueNames.forEach((vn) => {
      if (!(vn in v)) v[vn] = interpolators.get(vn)(asNumber(v.x) ?? i)
    })
    return v
  })
}

function getValuesInterpolators(orderedValues: any[], valueNames: Set<string>): Map<string, (x: number) => number> {
  return Array.from(valueNames).reduce((interpolators, vn) => {
    // A category is at its index among all the rows, where interpolateValues looks it up
    const indexesWithVn = orderedValues.map((_, i) => i).filter((i) => vn in orderedValues[i])
    const xs = indexesWithVn.map((i) => asNumber(orderedValues[i].x) ?? i)
    const ys = indexesWithVn.map((i) => orderedValues[i][vn])
    interpolators.set(vn, createMonotoneCubicInterpolator(xs, ys))
    return interpolators
  }, new Map<string, (x: number) => number>())
}

function getOutlierTickValue(adaptedYDomain: AxisDomain): number | Date {
  const maxRange = getDomainMaxValue(adaptedYDomain)
  const outlierStep = getOutlierStepFromDomain(adaptedYDomain)

  const outlierTickValue =
    typeof maxRange === 'number'
      ? maxRange + outlierStep
      : maxRange instanceof Date
      ? new Date(maxRange.getTime() + outlierStep)
      : null

  return outlierTickValue
}

const seriesHasOutliers = <XDomain>(
  outlierSeries: ChartSeries<XDomain>[],
  seriesIndex: number,
  dataIndex: number
): boolean => !!outlierSeries[seriesIndex]?.data[dataIndex]

const getOutlierSeriesConfig = <XDomain>(
  seriesName: string,
  seriesData: ChartSeriesDataPoint<XDomain>,
  outlierTickValue: number | Date
) => {
  return {
    [seriesName]: outlierTickValue,
    [getOutlierSeriesName(seriesName)]: { value: getDataPointValue(seriesData), series: seriesName },
  }
}
