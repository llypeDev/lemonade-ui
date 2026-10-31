import locale from '../../i18n/locales/en-US'

import { getAggregators, getCountAggregator } from './Aggregators/utils'
import { buildPivotTableTrees } from './buildPivotTableTrees'
import { buildTable } from './PivotTableGrid/buildTable'
import { KeyMap } from './model'

type Vegetable = { name: string; size: string; weight: number }

// The data of the PivotTableGrid story: broccoli 1 x1 and 2 x2, carrot 1 x1 and 2 x3
const rows: Vegetable[] = [
  { name: 'broccoli', size: '1', weight: 10 },
  { name: 'broccoli', size: '2', weight: 20 },
  { name: 'broccoli', size: '2', weight: 30 },
  { name: 'carrot', size: '1', weight: 5 },
  { name: 'carrot', size: '2', weight: 7 },
  { name: 'carrot', size: '2', weight: 8 },
  { name: 'carrot', size: '2', weight: 9 },
]

const keysMapping: KeyMap<Vegetable> = new Map([
  ['name', { keyName: 'Name' }],
  ['size', { keyName: 'Size' }],
])

describe('buildPivotTableTrees', () => {
  it('should count the rows of each group, as the story trees do', () => {
    const { defaultTree, complementaryTree } = buildPivotTableTrees(rows, ['name'], ['size'])

    expect(defaultTree).toMatchObject({
      nodeKey: 'name',
      nodeValue: 7,
      maxLeafValue: 3,
      broccoli: { nodeKey: 'size', nodeValue: 3, maxLeafValue: 2, 1: { nodeValue: 1 }, 2: { nodeValue: 2 } },
      carrot: { nodeKey: 'size', nodeValue: 4, maxLeafValue: 3, 1: { nodeValue: 1 }, 2: { nodeValue: 3 } },
    })
    expect(complementaryTree).toMatchObject({
      nodeKey: 'size',
      nodeValue: 7,
      1: { nodeKey: 'name', nodeValue: 2, carrot: { nodeValue: 1 }, broccoli: { nodeValue: 1 } },
      2: { nodeKey: 'name', nodeValue: 5, carrot: { nodeValue: 3 }, broccoli: { nodeValue: 2 } },
    })
  })

  it('should give the grid the same cells as the hand-written trees of the story', () => {
    const story = {
      defaultTree: {
        nodeKey: 'name',
        nodeValue: 7,
        broccoli: { nodeKey: 'size', nodeValue: 3, 1: { nodeValue: 1 }, 2: { nodeValue: 2 } },
        carrot: { nodeKey: 'size', nodeValue: 4, 1: { nodeValue: 1 }, 2: { nodeValue: 3 } },
      } as any,
      complementaryTree: {
        nodeKey: 'size',
        nodeValue: 7,
        1: { nodeKey: 'name', nodeValue: 2, carrot: { nodeValue: 1 }, broccoli: { nodeValue: 1 } },
        2: { nodeKey: 'name', nodeValue: 5, carrot: { nodeValue: 3 }, broccoli: { nodeValue: 2 } },
      } as any,
    }
    const built = buildPivotTableTrees(rows, ['name'], ['size'])
    const cells = (trees: typeof story) =>
      buildTable<Vegetable>(
        ['name'],
        ['size'],
        trees.defaultTree,
        trees.complementaryTree,
        keysMapping
      ).map(({ children, types, gridArea }) => ({ children, types: Array.from(types), gridArea: String(gridArea) }))

    expect(cells(built as any)).toEqual(cells(story))
  })

  it('should build only the default tree for rows or columns alone', () => {
    expect(buildPivotTableTrees(rows, ['name'], []).complementaryTree).toBeUndefined()
    expect(buildPivotTableTrees(rows, [], ['size']).defaultTree).toMatchObject({ nodeKey: 'size', nodeValue: 7 })
  })

  it('should aggregate a numeric key and compute percentages of the total', () => {
    const [count, percentage, average, maximum] = getAggregators(locale.aggregators)
    expect(count.id).toBe(getCountAggregator(locale.aggregators).id)

    const byAverage = buildPivotTableTrees(rows, ['name'], [], { aggregator: average, valueKey: 'weight' })
    expect(byAverage.defaultTree.broccoli.nodeValue).toBe(20)
    expect(byAverage.defaultTree.carrot.nodeValue).toBe(7.25)

    const byMaximum = buildPivotTableTrees(rows, ['name'], [], { aggregator: maximum, valueKey: 'weight' })
    expect(byMaximum.defaultTree.nodeValue).toBe(30)
    expect(byMaximum.defaultTree.maxLeafValue).toBe(30)

    const byPercentage = buildPivotTableTrees(rows, ['name'], [], { aggregator: percentage })
    expect(byPercentage.defaultTree.nodeValue).toBe(100)
    expect(byPercentage.defaultTree.carrot.nodeValue).toBeCloseTo(57.14, 2)
  })
})
