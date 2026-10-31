import { Aggregator, AggregatorEnum } from './Aggregators/model'
import { PivotTableTreeNode } from './PivotTableGrid/model'

export interface BuildPivotTableTreesOptions<T extends object> {
  /**
   * How the rows of each group become the value of a cell, such as the count or the average of a key.
   * @default the count of rows
   */
  aggregator?: Aggregator

  /**
   * Numeric key that aggregators such as the average, the maximum and the minimum read
   */
  valueKey?: keyof T
}

export interface PivotTableTrees<T extends object> {
  defaultTree: PivotTableTreeNode<T>
  complementaryTree?: PivotTableTreeNode<T>
}

const aggregate = <T extends object>(
  rows: T[],
  total: number,
  { aggregator, valueKey }: BuildPivotTableTreesOptions<T>
): number => {
  if (!aggregator || !aggregator.value || aggregator.id === AggregatorEnum.COUNT) {
    return rows.length
  }
  if (aggregator.keyDependent) {
    const values = rows.map((row) => Number(row[valueKey])).filter((value) => !isNaN(value))
    return values.length ? aggregator.value(values) : 0
  }
  // Aggregators that do not read a key, such as the percentage, work on the count of each row
  return aggregator.value(
    rows.map(() => 1),
    total
  )
}

const buildNode = <T extends object>(
  rows: T[],
  keys: Array<keyof T>,
  total: number,
  options: BuildPivotTableTreesOptions<T>
): PivotTableTreeNode<T> => {
  const node: any = { nodeValue: aggregate(rows, total, options) }
  if (keys.length === 0) {
    return node
  }

  const [key, ...rest] = keys
  const groups = new Map<string, T[]>()
  rows.forEach((row) => {
    const value = String(row[key])
    groups.set(value, [...(groups.get(value) || []), row])
  })

  node.nodeKey = key
  let maxLeafValue = -Infinity
  groups.forEach((groupRows, value) => {
    const child = buildNode(groupRows, rest, total, options)
    node[value] = child
    maxLeafValue = Math.max(maxLeafValue, child.maxLeafValue ?? child.nodeValue)
  })
  node.maxLeafValue = groups.size ? maxLeafValue : node.nodeValue
  return node
}

/**
 * Builds the trees that a `PivotTableGrid` draws from rows of data, grouping them by the row keys and the column
 * keys. Each node holds the aggregated value of its rows, the count by default, and the biggest value of its
 * leaves, which colors the cells.
 *
 * @example
 * const { defaultTree, complementaryTree } = buildPivotTableTrees(orders, ['region'], ['status'])
 */
export function buildPivotTableTrees<T extends object>(
  rows: T[],
  rowKeys: Array<keyof T>,
  columnKeys: Array<keyof T>,
  options: BuildPivotTableTreesOptions<T> = {}
): PivotTableTrees<T> {
  const total = rows.length
  const hasRows = rowKeys.length > 0
  const hasColumns = columnKeys.length > 0

  return {
    defaultTree: buildNode(rows, hasRows ? [...rowKeys, ...columnKeys] : columnKeys, total, options),
    complementaryTree: hasRows && hasColumns ? buildNode(rows, [...columnKeys, ...rowKeys], total, options) : undefined,
  }
}
