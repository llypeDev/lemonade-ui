import { useCombobox, UseComboboxState, UseComboboxStateChangeOptions } from 'downshift'
import matchSorter from 'match-sorter'
import React, { CSSProperties, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { PopperProps, usePopper } from 'react-popper'
import { useMemo } from 'react'
import { isNil } from 'lodash'
import { useLocale } from '../../i18n'
import { Theme, useStyles } from '../../styles'
import { composeHandlers, composeRefs } from '../../util/react'
import { FormControl } from '../FormControl'
import { useFormControl, UseFormControlProps } from '../../hooks/useFormControl'
import { TextInput, TextInputProps } from '../TextField'
import { EMPTY_ARRAY } from '../../util'
import { ComboboxComponents, defaultComboboxComponents } from './ComboboxMenuComponents'
import { useComboboxItemsLoader, useLoadItemsWhenOpen } from './useComboboxItemsLoader'
import { DefaultComboboxItemType } from './Combobox'
import { ListBox } from './ListBox'

export interface ComboboxSingleselectProps<T>
  extends Omit<TextInputProps, 'value' | 'onChange' | 'multiple'>,
    UseFormControlProps {
  value?: T
  items: T[] | ((query: string) => Promise<T[]>)
  itemToString(item: T): string
  createNewItem?(inputValue: string): T
  openOnFocus?: boolean
  loading: boolean
  open?: boolean
  debounceMilliseconds: number
  menuMinWidth?: number
  filter?(items: ReadonlyArray<T>, filter: string): T[]
  onChange?: (newValue: T) => void
  onFilterChange?: (newValue: string) => void
  components?: Partial<ComboboxComponents<T>>
  popperProps?: Omit<Partial<PopperProps<any>>, 'children'>

  inputId?: string
  labelId?: string
  menuId?: string
  toggleButtonId?: string
  getItemId?(index: number): string
}

export function ComboboxSingleselect<T = DefaultComboboxItemType>(props: ComboboxSingleselectProps<T>) {
  const defaultFilter = useCallback((items, filter) => matchSorter(items, filter, { keys: [props.itemToString] }), [
    props.itemToString,
  ])

  const {
    value,
    items,
    loading: externalLoading,
    debounceMilliseconds,
    createNewItem,
    components,
    itemToString,
    menuMinWidth,
    openOnFocus = true,
    onClear,
    onChange,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    onFilterChange,
    filter = defaultFilter,
    inputId,
    labelId,
    menuId,
    toggleButtonId,
    getItemId,
    open,
    popperProps,
    // Read by useFormControl, not attributes of the input
    label,
    error,
    inline,
    ...rest
  } = props

  const locale = useLocale()
  const { classes } = useStyles(createStyles)

  const isAsync = typeof items === 'function'
  const getItems = useCallback(
    (query: string) => (typeof items === 'function' ? items(query) : filter(items ?? EMPTY_ARRAY, query)),
    [items, filter]
  )
  const { loading: loadingItems, items: loadedItems, loadItems } = useComboboxItemsLoader(
    getItems,
    debounceMilliseconds
  )
  const isLoading = externalLoading || (isAsync && loadingItems)

  const inputRef = useRef<HTMLInputElement>()
  const [menuRef, setMenuRef] = useState<HTMLDivElement>()

  // The text of the picked item is not a filter: with it, the list would hold that item alone when it opens again
  const filterOf = (text: string, selectedItem: T) =>
    selectedItem !== null && selectedItem !== undefined && text === itemToString(selectedItem) ? '' : text

  const {
    isOpen,
    highlightedIndex,
    selectedItem,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getToggleButtonProps,
    getItemProps,
    openMenu,
    closeMenu,
    reset,
    setHighlightedIndex,
  } = useCombobox<T>({
    selectedItem: value,
    items: loadedItems,

    stateReducer: comboboxStateReducer(createNewItem, openOnFocus),
    itemToString,
    onInputValueChange: ({ inputValue, selectedItem, type }) => {
      // Only a text the user typed filters; a text set by a pick or by the value is the one of the picked item
      loadItems(type === useCombobox.stateChangeTypes.InputChange ? inputValue : filterOf(inputValue, selectedItem))
      onFilterChange?.(inputValue)
    },
    onSelectedItemChange: ({ selectedItem }) => {
      closeMenu()
      onChange?.(selectedItem)
    },

    // The label is tied to the input of an `id`
    inputId: inputId ?? props.id,
    labelId,
    menuId,
    toggleButtonId,
    getItemId,

    ...(isNil(open) ? {} : { isOpen: open }),
  })

  useLoadItemsWhenOpen(isOpen, items, loadItems, () => filterOf(inputRef.current?.value, selectedItem))

  // An item the loader built again is still the picked one when it has the same text
  const isItemSelected = (item: T) =>
    selectedItem !== null &&
    selectedItem !== undefined &&
    (item === selectedItem || itemToString(item) === itemToString(selectedItem))

  // The list may arrive after the menu opens, when downshift has found nothing to highlight: the picked item is
  // highlighted then, so the keyboard starts from it
  const highlightState = useRef({ highlightedIndex, isItemSelected, setHighlightedIndex })
  highlightState.current = { highlightedIndex, isItemSelected, setHighlightedIndex }
  useEffect(() => {
    const { highlightedIndex, isItemSelected, setHighlightedIndex } = highlightState.current
    if (isOpen && highlightedIndex === -1) {
      const index = loadedItems.findIndex(isItemSelected)
      index !== -1 && setHighlightedIndex(index)
    }
  }, [isOpen, loadedItems])

  // Without a label, nothing names the input and the menu by the id of the label
  const labelledBy: { 'aria-labelledby'?: string } = label ? {} : { 'aria-labelledby': undefined }

  const { getFormControlProps, getInputProps: getFormControlInputProps } = useFormControl(props)
  const { ref: downshiftInputRef, ...downshiftInputProps } = getInputProps<{
    ref?: MutableRefObject<HTMLInputElement>
  }>({
    onFocus: composeHandlers(onFocus, () => {
      openOnFocus && openMenu()
    }),
    onClick,
    onBlur,
    onKeyDown,
    ...labelledBy,
  })
  const { id: internalLabelId, ...downshiftLabelProps } = getLabelProps()
  const downshiftMenuProps = getMenuProps(labelledBy)
  const { ref: toggleButtonRef, ...downshiftToggleButtonProps } = getToggleButtonProps()

  const {
    styles: { popper: popperStyles },
    attributes: { popper: popperAttributes },
  } = usePopper(inputRef.current, menuRef, {
    placement: 'bottom-start',
    ...popperProps,
  })

  const formControlInputProps = getFormControlInputProps()
  const formControlProps = getFormControlProps()
  const invalid = !!formControlProps.error

  const componentsInner = useMemo(() => ({ ...defaultComboboxComponents, ...(components ?? {}) }), [components])

  return (
    <>
      <FormControl {...formControlProps} labelId={internalLabelId} {...downshiftLabelProps}>
        <TextInput
          icon={isOpen ? 'angleUp' : 'angleDown'}
          iconAriaLabel={isOpen ? locale.combobox.hideOptions : locale.combobox.showOptions}
          iconPosition='right'
          inputRef={composeRefs(inputRef, downshiftInputRef)}
          onClear={composeHandlers(reset, onClear)}
          invalid={invalid}
          iconProps={downshiftToggleButtonProps}
          iconRef={toggleButtonRef}
          {...formControlInputProps}
          {...downshiftInputProps}
          {...rest}
        />
      </FormControl>

      {/*By the ARIA definition, the menu element should always be in the DOM*/}
      <div aria-busy={isLoading} {...downshiftMenuProps}>
        {isOpen && (
          <ListBox<T>
            data-testid='menu'
            className={classes.menu}
            style={{
              ...popperStyles,
              width: inputRef.current?.clientWidth,
              minWidth: menuMinWidth,
            }}
            {...popperAttributes}
            ref={setMenuRef}
            createNewItem={createNewItem}
            components={componentsInner}
            getItemProps={getItemProps}
            highlightedIndex={highlightedIndex}
            isItemSelected={isItemSelected}
            itemToString={itemToString}
            items={loadedItems}
            loading={isLoading}
          />
        )}
      </div>
    </>
  )
}

const comboboxStateReducer = <T,>(createNewItem: (inputValue: string) => T, openOnFocus: boolean) => (
  state: UseComboboxState<T>,
  actionAndChanges: UseComboboxStateChangeOptions<T>
): Partial<UseComboboxState<T>> => {
  const { type, changes } = actionAndChanges
  switch (type) {
    case useCombobox.stateChangeTypes.InputChange:
      return {
        ...changes,
        // Typing over a picked item keeps it until the field loses the focus, without calling onChange. With nothing
        // picked, the state stays null as the value: downshift compares them, and a difference would replace the text
        // with the empty value right after `createNewItem` creates an item
        selectedItem: state.selectedItem === null ? null : undefined,
      }
    case useCombobox.stateChangeTypes.InputBlur:
      return {
        ...changes,
        // An item is created only from a text with something besides spaces
        ...(!changes.selectedItem &&
          (createNewItem && state.inputValue?.trim()
            ? { selectedItem: createNewItem(state.inputValue) }
            : {
                inputValue: '',
              })),
      }
    case useCombobox.stateChangeTypes.InputClick:
      return {
        ...changes,
        // The click opens a field that opens on focus, so a field that already had the focus opens too. It never
        // closes the menu: the focus of the same click has just opened it
        isOpen: openOnFocus || state.isOpen,
      }
    default:
      return changes
  }
}

export const createStyles = (theme: Theme) => ({
  menu: {
    display: 'flex',
    flexDirection: 'column',
    zIndex: theme.zIndex.dropdown,
    border: `1px solid ${theme.pallete.divider}`,
    borderRadius: theme.radius.popper,
    backgroundColor: theme.pallete.surface.main,
    boxShadow: theme.shadows.outer['40'],
    maxHeight: '20rem',
  } as CSSProperties,
})
