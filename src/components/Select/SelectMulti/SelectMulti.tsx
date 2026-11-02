import React, { useRef } from 'react'

import { useFormControl, UseFormControlProps } from '../../../hooks/useFormControl'
import { EMPTY_ARRAY, Omit } from '../../../util'
import { composeHandlers } from '../../../util/react'
import { Checkbox } from '../../Checkbox/Checkbox'
import { FormControl } from '../../FormControl'
import { HFlow } from '../../HFlow'
import { DefaultItemType } from '../SelectSingle'
import { SelectDownshiftMenu, SelectDownshiftMenuProps } from '../SelectSingle/SelectDownshiftMenu'

import { MultiDownshift, MultiDownshiftProps, MultiSelectRenderProps } from './MultiDownshift'
import { SelectMultiInput, SelectMultiInputProps } from './SelectMultiInput'

export interface SelectMultiProps<T = DefaultItemType>
  extends Omit<SelectMultiInputProps<T>, 'renderItem' | 'value' | 'onChange' | 'onRemoveItem'>,
    UseFormControlProps {
  value?: T[]

  // TODO!
  clearable?: boolean

  items: MultiDownshiftProps<T>['items']
  itemToString: MultiDownshiftProps<T>['itemToString']
  onChange?: MultiDownshiftProps<T>['onChange']
  isOpen?: MultiDownshiftProps<T>['isOpen']
  itemIsEqual?: MultiDownshiftProps<T>['itemIsEqual']
  onFilterChange?: MultiDownshiftProps<T>['onFilterChange']

  loading?: SelectDownshiftMenuProps<T>['loading']
  renderItem?: SelectDownshiftMenuProps<T>['renderItem']
  components?: SelectDownshiftMenuProps<T>['components']
  popperProps?: SelectDownshiftMenuProps<T>['popperProps']
}

export function SelectMulti<T>(props: SelectMultiProps<T>) {
  const {
    value,
    items,
    itemToString,
    onChange,
    isOpen,
    itemIsEqual,
    onFilterChange,
    loading,
    renderItem: externalRenderItem,
    components,
    popperProps,
    placeholder,
    label,
    error,
    ...rest
  } = props

  const inputWrapperRef = useRef<HTMLDivElement>()

  const handleItemRemove = (removeItem: Function) => (item: T) => removeItem(item)

  const renderItem = ({ isSelected }: MultiSelectRenderProps<T>) => (item: T) => (
    <HFlow hSpacing={0.5} alignItems='center'>
      <Checkbox style={{ pointerEvents: 'none' }} checked={isSelected(item)} tabIndex={-1} readOnly />
      {externalRenderItem ? externalRenderItem(item) : itemToString(item)}
    </HFlow>
  )

  //   const handleInputIconClick = ({ toggleMenu }: MultiSelectRenderProps<T>) => () => toggleMenu()
  const handleInputClick = ({ openMenu }: MultiSelectRenderProps<T>) => () => openMenu()
  const handleInputBlur = ({ closeMenu }: MultiSelectRenderProps<T>) => (e: React.FocusEvent<HTMLInputElement>) => {
    closeMenu()
    props.onBlur && props.onBlur(e)
  }
  const handleInputFocus = ({ openMenu }: MultiSelectRenderProps<T>) => (e: React.FocusEvent<HTMLInputElement>) => {
    openMenu()
    props.onFocus && props.onFocus(e)
  }

  const { getFormControlProps, getInputProps: getFormControlInputProps } = useFormControl(props)
  const formControlProps = getFormControlProps()
  const inputProps = getFormControlInputProps()
  const invalid = inputProps['aria-invalid']

  return (
    <FormControl {...formControlProps}>
      <MultiDownshift<T>
        // The same empty array on each render: a new one would replace the items picked without a value
        selectedItems={value || (EMPTY_ARRAY as T[])}
        items={items}
        itemToString={itemToString}
        onChange={onChange}
        isOpen={isOpen}
        itemIsEqual={itemIsEqual}
        onFilterChange={onFilterChange}
        labelId={formControlProps.labelId}
        // The input takes the `id`, which the label is for
        inputId={props.id}
      >
        {(downshift) => {
          const {
            // isOpen,
            getInputProps,
            selectedItems,
            removeItem,
            inputValue,
            visibleItems,
          } = downshift

          return (
            <div>
              <SelectMultiInput<T>
                wrapperRef={inputWrapperRef}
                items={selectedItems}
                {...rest}
                placeholder={!selectedItems || selectedItems.length === 0 ? placeholder : undefined}
                onRemoveItem={handleItemRemove(removeItem)}
                renderItem={itemToString}
                // icon={isOpen ? 'triangleUp' : 'triangleDown'}
                // onIconClick={this.handleInputIconClick(downshift)}
                {...getInputProps({
                  onBlur: handleInputBlur(downshift),
                  onFocus: handleInputFocus(downshift),
                  onClick: composeHandlers(handleInputClick(downshift), props.onClick),
                  onKeyDown: props.onKeyDown,
                })}
                {...inputProps}
                value={inputValue ? inputValue : ''}
                invalid={invalid}
              />
              <SelectDownshiftMenu
                popperProps={popperProps}
                anchorRef={inputWrapperRef}
                downshift={downshift}
                items={visibleItems}
                loading={loading}
                components={components}
                renderItem={renderItem(downshift)}
              />
            </div>
          )
        }}
      </MultiDownshift>
    </FormControl>
  )
}
