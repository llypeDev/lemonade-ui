import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HFlow } from '../../HFlow'
import { Theme, useStyles } from '../../../styles'
import { Aggregator } from '../Aggregators/model'
import { Cell, Grid } from '../../Grid'
import { Box } from '../Box/Box'
import { Droppable } from '../Droppable/Droppable'
import { Aggregators } from '../Aggregators/Aggregators'
import { Button } from '../../Button'
import { DroppableFilter } from '../Droppable/types/Filter'
import { KeyNavigationDirection } from '../Droppable/types/model'
import { useLocale } from '../../../i18n'
import { ModalMountTarget } from '../../Modal'
import { KeyMap } from '../model'
import { Text } from '../../Text'
import { BoardField, FieldFiltersByKey, FieldValuesByKey, PivotTableBoardOrigin, RowColumnKeys } from './model'
import { renderClearTableModal } from './render'
import { FilterValuesTags } from './FilterValuesTags'
import { useOnKeyNav } from './useOnKeyNav'
import { getInitialKeys, handleTagFilterRemove, initializeActiveFilters } from './utils'

export interface BoardAggregatorProps<T extends object> {
  /**
   * Called when the user picks another aggregator, such as the average
   */
  onChange: (aggregator: Aggregator) => void

  /**
   * Called when the user picks the numeric key that the aggregator reads
   */
  onKeyChange: (key: keyof T) => void

  value: Aggregator

  /**
   * Numeric key that the aggregator reads, for aggregators such as the average
   */
  key: keyof T
}

export interface PivotTableBoardProps<T extends object> {
  /**
   * Values of each key of the data, which the user can filter
   */
  keys: FieldValuesByKey<T>

  /**
   * Name, formatter and order of the values of each key
   */
  keyMapping: KeyMap<T>

  /**
   * Keys with numbers, which aggregators such as the average can read
   */
  numberKeys: Array<keyof T>

  /**
   * Shows that the table is being built after the user asked for it
   */
  isBuilding: boolean

  /**
   * Called with the row keys, the column keys and the filters when the user asks for the table
   */
  onSubmit: (values: RowColumnKeys<T>, filterValues: FieldFiltersByKey<T>) => void

  /**
   * Called when the user clears the table
   */
  onReset: () => void

  aggregator: BoardAggregatorProps<T>

  /**
   * Keys that start in the rows, in the columns or with filters
   */
  initialFields?: Array<BoardField<T>>

  /**
   * Level of the headings of the four areas of the board, so they follow the headings of the page. Defaults to 4.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

/**
 * Board where the user builds a pivot table: dragging the keys of the data to the rows and the columns, filtering
 * their values and picking how the cells are aggregated. It does not draw the table: `onSubmit` gives the keys and
 * the filters, and the application draws a `PivotTableGrid`, such as with `buildPivotTableTrees`.
 */
export function PivotTableBoard<T extends object>(props: PivotTableBoardProps<T>) {
  const {
    keys,
    keyMapping,
    onSubmit,
    numberKeys,
    isBuilding,
    onReset,
    aggregator,
    initialFields,
    headingLevel = 4,
  } = props

  const { pivotTableBoard: pivotTableBoardLabels } = useLocale()

  const allFiltersByKey = useMemo(() => new Map(Array.from(keys).map(([key, values]) => [key, new Set(values)])), [
    keys,
  ])

  const [filterState, setFilterState] = useState<FieldFiltersByKey<T>>(allFiltersByKey)

  const [initialized, setInitialized] = useState(false)
  const [rowKeys, setRowKeys] = useState<Array<keyof T>>([])
  const [columnKeys, setColumnKeys] = useState<Array<keyof T>>([])
  const [availableKeys, setAvailableKeys] = useState<Array<keyof T>>([])

  useEffect(() => {
    if (!initialized) {
      const { initialRowKeys, initialColumnKeys, initialAvailableKeys } = getInitialKeys(keys, initialFields)

      setFilterState(initializeActiveFilters(allFiltersByKey, keys, initialFields))

      setRowKeys(initialRowKeys)
      setColumnKeys(initialColumnKeys)
      setAvailableKeys(initialAvailableKeys)
      setInitialized(true)
    }
  }, [initialized, keys, allFiltersByKey, initialFields])

  const { classes } = useStyles(createStyles)

  const handleGenerateTableClick = useCallback(() => onSubmit([rowKeys, columnKeys], filterState), [
    columnKeys,
    filterState,
    onSubmit,
    rowKeys,
  ])

  const handleClearFilters = useCallback(() => setFilterState(allFiltersByKey), [allFiltersByKey])

  const handleTableReset = useCallback(() => {
    setColumnKeys([])
    setRowKeys([])
    handleClearFilters()
    onReset()
    setAvailableKeys(Array.from(keys.keys()))
  }, [handleClearFilters, onReset, keys])

  const moveKey = useOnKeyNav({
    setColumnKeys,
    setRowKeys,
    setAvailableKeys,
    columnKeys,
    rowKeys,
    availableKeys,
  })

  // A key moved with the arrow keys is drawn again in its new area, so the focus goes to it there instead of being lost
  const boardRef = useRef<HTMLDivElement>()
  const [movedKey, setMovedKey] = useState<keyof T>()
  const onKeyNav = useCallback(
    (direction: KeyNavigationDirection, origin: PivotTableBoardOrigin, key?: keyof T) => {
      const moved = moveKey(direction, origin, key)
      moved && setMovedKey(key)
      return moved
    },
    [moveKey]
  )
  useEffect(() => {
    if (movedKey !== undefined) {
      const buttons = Array.from(boardRef.current?.querySelectorAll<HTMLElement>('[data-key]') ?? [])
      buttons.find((button) => button.dataset.key === String(movedKey))?.focus()
      setMovedKey(undefined)
    }
  }, [movedKey])

  const handleFilterUpdate = useCallback(
    (key: keyof T, filter: Set<string>) => {
      setFilterState(() => {
        const newState = new Map(filterState)
        if (filter.size === 0) {
          newState.delete(key)
        } else {
          newState.set(key, filter)
        }
        return newState
      })
    },
    [filterState]
  )

  const handleRemoveTag = useCallback(
    (key: keyof T, value: string) => {
      handleFilterUpdate(key, handleTagFilterRemove(key, value, filterState))
    },
    [filterState, handleFilterUpdate]
  )

  const filter: DroppableFilter<T> = useMemo(
    () => ({
      handleUpdate: handleFilterUpdate,
      keys: keys,
      state: filterState,
    }),
    [handleFilterUpdate, keys, filterState]
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={boardRef}>
        <Grid>
          <Cell md={6} sm={12} xs={12}>
            <Box label={pivotTableBoardLabels.availableFields} headingLevel={headingLevel}>
              <Droppable<T, PivotTableBoardOrigin>
                data-testid='droppable-available'
                keyState={availableKeys}
                filter={filter}
                keyMapping={keyMapping}
                handleKeyUpdate={setAvailableKeys}
                onKeyNav={onKeyNav}
                name='filter'
                accept='filter'
              />
            </Box>
          </Cell>
          <Cell md={6} sm={12} xs={12}>
            <Box label={pivotTableBoardLabels.columns} icon='hamburguerMenu' rotation='90' headingLevel={headingLevel}>
              <Droppable<T, PivotTableBoardOrigin>
                data-testid='droppable-column'
                keyState={columnKeys}
                filter={filter}
                keyMapping={keyMapping}
                handleKeyUpdate={setColumnKeys}
                onKeyNav={onKeyNav}
                name='column'
                accept='filter'
              />
            </Box>
          </Cell>
          <Cell md={6} sm={12} xs={12}>
            <Box label={pivotTableBoardLabels.rows} icon='hamburguerMenu' headingLevel={headingLevel}>
              <Droppable<T, PivotTableBoardOrigin>
                data-testid='droppable-row'
                keyState={rowKeys}
                filter={filter}
                keyMapping={keyMapping}
                handleKeyUpdate={setRowKeys}
                onKeyNav={onKeyNav}
                name='row'
                accept='filter'
              />
            </Box>
          </Cell>
          <Cell md={6} sm={12} xs={12}>
            <Box label={pivotTableBoardLabels.kindOfPresentation} headingLevel={headingLevel}>
              <div className={classes.aggregatorsContainer}>
                <Aggregators
                  numberKeys={numberKeys}
                  keyMapping={keyMapping}
                  handleAggregatorChange={aggregator.onChange}
                  handleAggregatorKeyChange={aggregator.onKeyChange}
                  aggregator={aggregator.value}
                  aggregatorKey={aggregator.key}
                />
              </div>
            </Box>
          </Cell>
          <Cell sm={12}>
            <div className={classes.filtersContainer}>
              <Grid wrap alignItems='center'>
                <Cell size={10}>
                  <HFlow alignItems='center'>
                    <Text fontWeight='bold'>{pivotTableBoardLabels.appliedFilters}</Text>
                    <FilterValuesTags
                      filterState={filterState}
                      keys={keys}
                      keyMapping={keyMapping}
                      onRemoveTag={handleRemoveTag}
                    />
                  </HFlow>
                </Cell>
                <Cell size={2}>
                  <Button
                    onClick={handleClearFilters}
                    size='small'
                    kind='normal'
                    skin='outline'
                    style={{ float: 'right' }}
                  >
                    {pivotTableBoardLabels.clearFilters}
                  </Button>
                </Cell>
              </Grid>
            </div>
          </Cell>
          <Cell size={12}>
            <HFlow justifyContent='flex-end'>
              <Button
                kind='normal'
                size='medium'
                onClick={renderClearTableModal(pivotTableBoardLabels, handleTableReset)}
              >
                {pivotTableBoardLabels.clearTable}
              </Button>
              <ModalMountTarget />
              <Button
                kind='primary'
                size='medium'
                onClick={handleGenerateTableClick}
                loading={isBuilding}
                disabled={isBuilding}
              >
                {pivotTableBoardLabels.generateTable}
              </Button>
            </HFlow>
          </Cell>
        </Grid>
      </div>
    </DndProvider>
  )
}

const createStyles = (theme: Theme) => ({
  aggregatorsContainer: {
    padding: '0.75rem',
    margin: '0.25rem',
    minHeight: '7.18rem',
  } as CSSProperties,
  filtersContainer: {
    border: `1px solid ${theme.pallete.divider}`,
    padding: '0.75rem 1.25rem',
  } as CSSProperties,
})
