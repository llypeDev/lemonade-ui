import { useLocale } from '@lemonade/ui'
import {
  Aggregator,
  BoardField,
  buildPivotTableTrees,
  FieldFiltersByKey,
  getCountAggregator,
  KeyMap,
  PivotTableBoard,
  PivotTableGrid,
  PivotTableProvider,
  PivotTableTrees,
  RowColumnKeys,
} from '@lemonade/ui/lib/components/PivotTable'
import React, { useState } from 'react'

interface Order {
  region: string
  product: string
  status: string
  total: number
}

const regions = ['North', 'South', 'East']
const products = ['Coffee', 'Tea', 'Mugs']

const orders: Order[] = Array.from({ length: 36 }, (_, index) => ({
  region: regions[index % 3],
  product: products[Math.floor(index / 4) % 3],
  status: index % 5 === 0 ? 'Pending' : 'Paid',
  total: 20 + ((index * 37) % 90),
}))

// The values of each key that the user can drag and filter
const keys = new Map<keyof Order, string[]>([
  ['region', regions],
  ['product', products],
  ['status', ['Paid', 'Pending']],
])

const keyMapping: KeyMap<Order> = new Map([
  ['region', { keyName: 'Region' }],
  ['product', { keyName: 'Product' }],
  ['status', { keyName: 'Status' }],
  ['total', { keyName: 'Total (R$)' }],
])

const initialFields: Array<BoardField<Order>> = [
  { key: 'region', origin: 'row', filters: [] },
  { key: 'status', origin: 'column', filters: [] },
]

function PivotTableDemo() {
  const locale = useLocale()
  const [aggregator, setAggregator] = useState<Aggregator>(getCountAggregator(locale.aggregators))
  const [aggregatorKey, setAggregatorKey] = useState<keyof Order>()
  const [table, setTable] = useState<{ trees: PivotTableTrees<Order>; keys: RowColumnKeys<Order> }>(null)

  const handleSubmit = (rowColumnKeys: RowColumnKeys<Order>, filters: FieldFiltersByKey<Order>) => {
    // Keeps the orders whose values the user left checked
    const filtered = orders.filter((order) =>
      Array.from(filters).every(([key, values]) => values.has(String(order[key])))
    )
    const [rowKeys, columnKeys] = rowColumnKeys
    setTable({
      trees: buildPivotTableTrees(filtered, rowKeys, columnKeys, { aggregator, valueKey: aggregatorKey }),
      keys: rowColumnKeys,
    })
  }

  return (
    <div>
      <PivotTableBoard<Order>
        keys={keys}
        keyMapping={keyMapping}
        numberKeys={['total']}
        isBuilding={false}
        initialFields={initialFields}
        headingLevel={3}
        onSubmit={handleSubmit}
        onReset={() => setTable(null)}
        aggregator={{ value: aggregator, onChange: setAggregator, key: aggregatorKey, onKeyChange: setAggregatorKey }}
      />
      {table && (
        <div style={{ marginTop: '1rem' }}>
          <PivotTableProvider maxValue={table.trees.defaultTree.maxLeafValue} suffix={aggregator.suffix ?? ''}>
            <PivotTableGrid<Order>
              keysMapping={keyMapping}
              defaultTree={table.trees.defaultTree}
              complementaryTree={table.trees.complementaryTree}
              rowKeys={table.keys[0]}
              columnKeys={table.keys[1]}
            />
          </PivotTableProvider>
        </div>
      )}
    </div>
  )
}

export default PivotTableDemo
