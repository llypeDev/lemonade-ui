import * as PivotTable from './index'

// The pivot table has its own entry point, @lemonade/ui/lib/components/PivotTable
it('should export the public API of the pivot table', () => {
  expect(Object.keys(PivotTable).sort()).toEqual([
    'AggregatorEnum',
    'PivotTableBoard',
    'PivotTableGrid',
    'PivotTableProvider',
    'buildPivotTableTrees',
    'getAggregators',
    'getCountAggregator',
  ])
})
