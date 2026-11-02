import { render } from '@testing-library/react'
import React from 'react'
import { randomStr } from '../../../util/string'
import { KeyMap } from '../model'
import { Aggregators } from './Aggregators'
import { Aggregator, AggregatorEnum } from './model'

jest.mock('../../../util/string')

describe('PivotTable - Aggregators', () => {
  type Test = {
    name: string
  }

  const handleAggregatorChange = (aggregator: Aggregator) => null

  const handleAggregatorKeyChange = (key: keyof Test) => null

  const keyMapping: KeyMap<Test> = new Map([['name', { keyName: 'Name' }]])

  const countAggregator = {
    id: AggregatorEnum.COUNT,
    label: 'Count',
    value: undefined,
    keyDependent: false,
  }

  it('should render correctly', () => {
    const { container } = render(
      <Aggregators<Test>
        numberKeys={[]}
        keyMapping={keyMapping}
        handleAggregatorChange={handleAggregatorChange}
        handleAggregatorKeyChange={handleAggregatorKeyChange}
        aggregator={countAggregator}
        aggregatorKey='name'
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should render correctly with numberKeys', () => {
    const { container } = render(
      <Aggregators<Test>
        numberKeys={['name']}
        keyMapping={keyMapping}
        handleAggregatorChange={handleAggregatorChange}
        handleAggregatorKeyChange={handleAggregatorKeyChange}
        aggregator={countAggregator}
        aggregatorKey='name'
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('should name the select of the key that the aggregator reads', () => {
    const { getByRole } = render(
      <Aggregators<Test>
        numberKeys={['name']}
        keyMapping={keyMapping}
        handleAggregatorChange={handleAggregatorChange}
        handleAggregatorKeyChange={handleAggregatorKeyChange}
        aggregator={{ id: AggregatorEnum.AVERAGE, label: 'Average', value: undefined, keyDependent: true }}
        aggregatorKey='name'
      />
    )
    expect(getByRole('textbox', { name: 'Field to aggregate' })).toHaveValue('Name')
  })

  it('should keep the aggregators of two boards apart', () => {
    ;(randomStr as jest.Mock).mockReturnValueOnce('first').mockReturnValueOnce('second')
    const aggregators = (
      <Aggregators<Test>
        numberKeys={[]}
        keyMapping={keyMapping}
        handleAggregatorChange={handleAggregatorChange}
        handleAggregatorKeyChange={handleAggregatorKeyChange}
        aggregator={countAggregator}
        aggregatorKey='name'
      />
    )
    const { getAllByRole } = render(
      <>
        {aggregators}
        {aggregators}
      </>
    )
    const [first, second] = getAllByRole('radio', { name: 'Count' })
    expect(first.getAttribute('name')).not.toEqual(second.getAttribute('name'))
  })
})
