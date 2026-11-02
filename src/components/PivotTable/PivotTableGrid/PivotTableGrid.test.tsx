import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { createTheme, hexToRGB } from '../../../styles'
import { KeyConfig } from '../model'
import { PivotTableProvider } from '../PivotTableCell/PivotTableProvider'
import { PivotTableGrid } from './PivotTableGrid'
import { PivotTableProps } from './model'

type Fruit = {
  name: string
  size: string
}
const createComponent = () => {
  const props: PivotTableProps<Fruit> = {
    keysMapping: new Map([
      [
        'name' as keyof Fruit,
        {
          keyName: 'Name',
          ordenator(a, b) {
            return a > b ? 1 : -1
          },
          formatter(a) {
            return a[0].toLocaleUpperCase() + a.slice(1)
          },
        } as KeyConfig,
      ],
      [
        'size' as keyof Fruit,
        {
          keyName: 'Weight',
          ordenator(a, b) {
            return a > b ? 1 : -0
          },
          formatter(a) {
            return a + ' kg'
          },
        } as KeyConfig,
      ],
    ]),
    defaultTree: {
      nodeKey: 'name',
      nodeValue: 7,
      maxLeafValue: 3,
      broccoli: {
        nodeKey: 'size',
        nodeValue: 3,
        maxLeafValue: 1,
        1: { nodeValue: 1 },
        2: { nodeValue: 2 },
      },
      carrot: {
        nodeKey: 'size',
        nodeValue: 4,
        maxLeafValue: 3,
        1: { nodeValue: 1 },
        2: { nodeValue: 3 },
      },
    } as any,
    complementaryTree: {
      nodeKey: 'size',
      nodeValue: 7,
      maxLeafValue: 3,
      1: {
        nodeKey: 'name',
        nodeValue: 2,
        maxLeafValue: 1,
        carrot: { nodeValue: 1 },
        broccoli: { nodeValue: 1 },
      },
      2: {
        nodeKey: 'name',
        nodeValue: 5,
        maxLeafValue: 3,
        carrot: { nodeValue: 3 },
        broccoli: { nodeValue: 2 },
      },
    } as any,
    rowKeys: ['name'],
    columnKeys: ['size'],
  }
  const maxLeafValue = props.defaultTree.maxLeafValue as number
  return (
    <PivotTableProvider maxValue={maxLeafValue} suffix=''>
      <PivotTableGrid {...props}></PivotTableGrid>
    </PivotTableProvider>
  )
}

describe('PivotTableGrid', () => {
  it('should render correctly', () => {
    const { container } = render(createComponent())
    expect(container).toMatchSnapshot()
  })

  it('should apply hover in a cross', () => {
    const { container } = render(createComponent())
    const cellToHover = container.querySelector('div[data-columnnumber="3"][data-rownumber="3"]')!!
    const cellColumnHeader = container.querySelector('div[data-columnnumber="3"][data-rownumber="1 2"]')!!
    const cellRowHeader = container.querySelector('div[data-columnnumber="1 2"][data-rownumber="3"]')!!
    const cellRightValue = container.querySelector('div[data-columnnumber="4"][data-rownumber="3"]')!!
    const cellBottomValue = container.querySelector('div[data-columnnumber="3"][data-rownumber="4"]')!!
    const cellColumnTotal = container.querySelector('div[data-columnnumber="3"][data-rownumber="5"]')!!
    const cellRowTotal = container.querySelector('div[data-columnnumber="5"][data-rownumber="3"]')!!

    expect(window.getComputedStyle(cellToHover).backgroundColor).toEqual('rgb(194, 220, 78)')

    fireEvent.mouseEnter(cellToHover)

    expect(window.getComputedStyle(cellToHover).backgroundColor).toEqual('rgba(194, 220, 78, 0.5)')
    expect(window.getComputedStyle(cellColumnHeader).backgroundColor).toEqual('rgba(240, 240, 245, 0.5)')
    expect(window.getComputedStyle(cellRowHeader).backgroundColor).toEqual('rgba(240, 240, 245, 0.5)')
    expect(window.getComputedStyle(cellColumnTotal).backgroundColor).toEqual('rgba(240, 240, 245, 0.5)')
    expect(window.getComputedStyle(cellRowTotal).backgroundColor).toEqual('rgba(240, 240, 245, 0.5)')
    expect(window.getComputedStyle(cellRightValue).backgroundColor).toEqual('rgba(94, 115, 0, 0.5)')
    expect(window.getComputedStyle(cellBottomValue).backgroundColor).toEqual('rgba(194, 220, 78, 0.5)')
  })

  it('should not apply the hover to another table on the page', () => {
    const { container } = render(
      <>
        <div data-testid='first'>{createComponent()}</div>
        <div data-testid='second'>{createComponent()}</div>
      </>
    )
    const [first, second] = Array.from(container.querySelectorAll('[data-testid]'))
    const cellToHover = first.querySelector('div[data-columnnumber="3"][data-rownumber="3"]')!!

    fireEvent.mouseEnter(cellToHover)

    expect(first.querySelector('div[data-columnnumber="3"][data-rownumber="3"]')).toHaveAttribute('style')
    expect(second.querySelectorAll('div[style]')).toHaveLength(0)

    fireEvent.mouseLeave(cellToHover)
    expect(first.querySelectorAll('div[style]')).toHaveLength(0)
  })

  it('should apply the hover to the cells of a table built again', () => {
    const vertical = (tree: object) => (
      <PivotTableProvider maxValue={3}>
        <PivotTableGrid<Fruit>
          keysMapping={new Map([['name', { keyName: 'Name' }]])}
          defaultTree={{ nodeKey: 'name', maxLeafValue: 3, ...tree } as any}
          complementaryTree={{} as any}
          rowKeys={['name']}
          columnKeys={[]}
        />
      </PivotTableProvider>
    )
    const { container, rerender } = render(vertical({ nodeValue: 1, broccoli: { nodeValue: 1 } }))
    rerender(vertical({ nodeValue: 4, broccoli: { nodeValue: 1 }, carrot: { nodeValue: 3 } }))

    fireEvent.mouseEnter(container.querySelector('div[data-columnnumber="2"][data-rownumber="3"]')!!)

    // The total of the column, which only the table built again has
    expect(container.querySelector('div[data-columnnumber="2"][data-rownumber="5"]')).toHaveAttribute('style')
  })

  it.each([
    ['en-US', '1,234', '617'],
    ['pt-BR', '1.234', '617'],
  ])(
    'should color the value cells by their number when the %s locale separates the thousands',
    (language, max, half) => {
      const languages = jest.spyOn(navigator, 'languages', 'get').mockReturnValue([language])
      const { pallete } = createTheme()
      const { container } = render(
        <PivotTableProvider maxValue={1234}>
          <PivotTableGrid<Fruit>
            keysMapping={new Map([['name', { keyName: 'Name' }]])}
            defaultTree={
              {
                nodeKey: 'name',
                nodeValue: 1851,
                maxLeafValue: 1234,
                broccoli: { nodeValue: 1234 },
                carrot: { nodeValue: 617 },
              } as any
            }
            complementaryTree={{} as any}
            rowKeys={['name']}
            columnKeys={[]}
          />
        </PivotTableProvider>
      )
      const broccoli = container.querySelector('div[data-rownumber="3"][data-columnnumber="2"]')!!
      const carrot = container.querySelector('div[data-rownumber="4"][data-columnnumber="2"]')!!

      expect(broccoli).toHaveTextContent(max)
      expect(carrot).toHaveTextContent(half)
      expect(window.getComputedStyle(broccoli).backgroundColor).toEqual(hexToRGB(pallete.primary.c10))
      expect(window.getComputedStyle(carrot).backgroundColor).toEqual(hexToRGB(pallete.primary.c60))
      languages.mockRestore()
    }
  )
})
