import { createEvent, fireEvent, render, act } from '@testing-library/react'
import React from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { LocaleContext } from '../../../i18n'
import enUS from '../../../i18n/locales/en-US'
import { KeyMapping } from './types/KeyMapping'
import { FilterDraggable, FilterDraggableProps } from './FilterDraggable'
import { useDraggableKeyNavigation } from './useDraggableNavigation'

// Lets pending updates, such as popper positions and debounced loads, settle inside act
const flush = () => act(async () => undefined)

jest.mock('./useDraggableNavigation')
const mockedUseDraggableKeyNavigation = useDraggableKeyNavigation as jest.Mock

type Pet = {
  name: string
}

const origin = 'keys_available'

const petKeyMapping = new Map<keyof Pet, KeyMapping>([['name', { keyName: 'Name' }]])

const keyState: Array<keyof Pet> = ['name']
const key: keyof Pet = keyState[0]
const keys = new Map<keyof Pet, string[]>([['name', ['Bebel', 'Foguete', 'Scooby-Doo']]])

const createFilterComponent = (props: Partial<FilterDraggableProps<Pet>> = {}) => (
  <LocaleContext.Provider value={enUS}>
    <FilterDraggable<Pet>
      key={key}
      name={key}
      type={'test'}
      onDragEnd={() => {}}
      value={petKeyMapping.get(key).keyName}
      origin={origin}
      selectedItems={new Set<string>()}
      filterItems={keys.get(key)}
      onFilterUpdate={() => {}}
      {...props}
    />
  </LocaleContext.Provider>
)

export function DroppableDiv(props: any) {
  const [, drag] = useDrop({
    accept: props.type,
    drop() {
      return { result: 'drop' }
    },
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div ref={drag} className='droppable'>
      {props.children}
    </div>
  )
}

describe('FilterDraggable', () => {
  const mockKeyDownHandler = jest.fn()
  const mockHandleKeyDown = jest.fn().mockReturnValue(mockKeyDownHandler)

  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseDraggableKeyNavigation.mockReturnValue({
      handleKeyDown: mockHandleKeyDown,
    })
  })

  describe('render', () => {
    it('should render correctly with no values of selectedItems', async () => {
      const { container } = render(createFilterComponent())
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly with all values of selectedItems', async () => {
      const { container } = render(createFilterComponent({ selectedItems: new Set<string>(keys.get(key)) }))
      expect(container).toMatchSnapshot()
      await flush()
    })

    it('should render correctly with some values of selectedItems', async () => {
      const { container } = render(
        createFilterComponent({ selectedItems: new Set<string>(['Bebel']) })
      )
      expect(container).toMatchSnapshot()
      await flush()
    })
  })

  it('should throw an error when the prop filterItems is empty', async () => {
    // The render throws on purpose, and React and jsdom report the error on the console
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => {
      render(createFilterComponent({ filterItems: [] }))
    }).toThrowError()
    consoleError.mockRestore()
    await flush()
  })

  it('should throw an error when the prop selectedItems contains an item that does not belong to the filterItems', async () => {
    // The render throws on purpose, and React and jsdom report the error on the console
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => {
      render(createFilterComponent({ selectedItems: new Set<string>('Mel') }))
    }).toThrowError()
    consoleError.mockRestore()
    await flush()
  })

  it('should show the drop down menu when the user clicks on component', async () => {
    const { getByRole, getAllByRole, getByText } = render(createFilterComponent())

    const button = getByRole('button')

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBeTruthy()

    expect(getAllByRole('menuitem')).toHaveLength(5) // Search + All items + Bebel + Foguete + Scooby-Doo

    expect(getByText('All items')).toBeDefined()
    expect(getByText('Bebel')).toBeDefined()
    expect(getByText('Foguete')).toBeDefined()
    expect(getByText('Scooby-Doo')).toBeDefined()
    await flush()
  })

  it('should close the dropdown menu when the user clicks on the component when it is open', async () => {
    const { getByRole, getAllByRole } = render(createFilterComponent())

    const button = getByRole('button')

    fireEvent.click(button) // open

    expect(getAllByRole('checkbox')).toHaveLength(4) // options + all items

    fireEvent.click(button) // close

    expect(() => {
      getAllByRole('checkbox')
    }).toThrowError()
    await flush()
  })

  describe('handleFilterUpdate', () => {
    describe('handleSelectAll', () => {
      it('should pass a empty set when the user uncheck "all items" checkbox', async () => {
        const onFilterUpdate = jest.fn()
        const { getByRole, getAllByRole } = render(
          createFilterComponent({ onFilterUpdate: onFilterUpdate, selectedItems: new Set<string>(keys.get(key)) })
        )

        const button = getByRole('button')

        fireEvent.click(button)

        const allItemsCheckbox = getAllByRole('checkbox')[0]

        fireEvent.click(allItemsCheckbox)

        expect(onFilterUpdate).toBeCalledWith('name', new Set<string>(new Set<string>()))
        await flush()
      })

      it('should pass all values in a set when the user check "all items" checkbox', async () => {
        const onFilterUpdate = jest.fn()
        const { getByRole, getAllByRole } = render(createFilterComponent({ onFilterUpdate: onFilterUpdate }))

        const button = getByRole('button')

        fireEvent.click(button)

        const allItemsCheckbox = getAllByRole('checkbox')[0]

        fireEvent.click(allItemsCheckbox)

        expect(onFilterUpdate).toBeCalledWith(
          'name',
          new Set<string>(['Bebel', 'Foguete', 'Scooby-Doo'])
        )
        await flush()
      })
    })

    describe('handleSelect', () => {
      it('should return a set with "Bebel" when the user check its checkbox', async () => {
        const onFilterUpdate = jest.fn()
        const { getByRole, getAllByRole } = render(createFilterComponent({ onFilterUpdate: onFilterUpdate }))

        const button = getByRole('button')

        fireEvent.click(button)

        const checkbox = getAllByRole('checkbox')[1]

        fireEvent.click(checkbox)

        expect(onFilterUpdate).toBeCalledWith(
          'name',
          new Set<string>(['Bebel'])
        )
        await flush()
      })

      it('should return an empty set when the user uncheck "Bebel" checkbox', async () => {
        const onFilterUpdate = jest.fn()
        const { getByRole, getAllByRole } = render(
          createFilterComponent({
            onFilterUpdate: onFilterUpdate,
            selectedItems: new Set<string>(['Bebel']),
          })
        )

        const button = getByRole('button')

        fireEvent.click(button)

        const checkbox = getAllByRole('checkbox')[1]

        fireEvent.click(checkbox)

        expect(onFilterUpdate).toBeCalledWith('name', new Set<string>())
        await flush()
      })

      it('should return all options when the user check the "Foguete" checkbox', async () => {
        const onFilterUpdate = jest.fn()

        const { getByRole, getAllByRole } = render(
          createFilterComponent({
            onFilterUpdate: onFilterUpdate,
            selectedItems: new Set<string>(['Bebel', 'Scooby-Doo']),
          })
        )

        const button = getByRole('button')

        fireEvent.click(button)

        const checkbox = getAllByRole('checkbox')[2]

        fireEvent.click(checkbox)

        expect(onFilterUpdate).toBeCalledWith('name', new Set<string>(keys.get(key)))
        await flush()
      })
    })
  })

  describe('handleSearch', () => {
    it('should show only Scooby-Doo checkbox when the user types "Sco" ', async () => {
      const { getByRole, getByPlaceholderText, getAllByRole } = render(createFilterComponent())

      const button = getByRole('button')

      fireEvent.click(button)

      const input = getByPlaceholderText('Search')

      fireEvent.change(input, { target: { value: 'Sco' } })

      expect(getByRole('checkbox').title).toEqual('Scooby-Doo')

      expect(getAllByRole('checkbox')).toHaveLength(1)
      await flush()
    })

    it('should show an empty list when the user types "Mel" ', async () => {
      const { getByRole, getByPlaceholderText, getAllByRole } = render(createFilterComponent())

      const button = getByRole('button')

      fireEvent.click(button)

      const input = getByPlaceholderText('Search')

      fireEvent.change(input, { target: { value: 'Mel' } })

      expect(() => {
        getAllByRole('checkbox')
      }).toThrowError()
      await flush()
    })
  })

  describe('events', () => {
    it('should prevent and not propagate the mouse down event when the user make this event on checkbox', async () => {
      const { getByRole, getAllByRole } = render(createFilterComponent())

      const button = getByRole('button')

      fireEvent.click(button)

      const checkbox = getAllByRole('checkbox')[1]

      const mouseDownEvent = createEvent.mouseDown(checkbox)

      const spy = spyOn(mouseDownEvent, 'stopPropagation')

      fireEvent(checkbox, mouseDownEvent)

      expect(mouseDownEvent.defaultPrevented).toBeTruthy()

      expect(spy).toBeCalled()
      await flush()
    })

    it('should not propagate the blur event when the user remove the focus on drop down area', async () => {
      const { getByRole } = render(createFilterComponent())

      const button = getByRole('button')

      fireEvent.click(button)

      const dropDownArea = getByRole('menu').firstChild

      fireEvent.focus(dropDownArea)

      const blurEvent = createEvent.blur(dropDownArea)

      const spy = spyOn(blurEvent, 'stopPropagation')

      fireEvent(dropDownArea, blurEvent)

      expect(spy).toBeCalled()
      await flush()
    })
  })

  it('should not show invalid values on drop down menu', async () => {
    const { getByRole, getAllByRole } = render(
      createFilterComponent({ filterItems: new Array<string>(undefined, '', null) })
    )

    const button = getByRole('button')

    fireEvent.click(button)

    expect(getAllByRole('checkbox')).toHaveLength(1) // only the 'All items' checkbox
    await flush()
  })

  describe('Drag and drop', () => {
    it('should call onDragEnd when the drag event ends', async () => {
      const onDragEnd = jest.fn()
      const { container } = render(
        <DndProvider backend={HTML5Backend}>
          <DroppableDiv type='test'>{createFilterComponent({ onDragEnd })}</DroppableDiv>
          <DroppableDiv type='test' />
        </DndProvider>
      )

      const draggable = container.querySelectorAll('div[class*=droppable]')[0].firstChild

      const secondDiv = container.querySelectorAll('div[class*=droppable]')[1]

      fireEvent.dragStart(draggable)
      fireEvent.dragEnter(secondDiv)
      fireEvent.dragOver(secondDiv)
      fireEvent.drop(secondDiv)
      fireEvent.dragEnd(draggable)

      expect(onDragEnd).toHaveBeenCalled()
      await flush()
    })
  })

  describe('Keyboard navigation', () => {
    it('should call useDraggableKeyNavigation with correct params and trigger its returned function on key down', async () => {
      const onDragEnd = jest.fn()
      const onKeyNav = jest.fn()

      const { getByRole } = render(
        <DndProvider backend={HTML5Backend}>
          <DroppableDiv type='test'>{createFilterComponent({ onDragEnd, onKeyNav })}</DroppableDiv>
          <DroppableDiv type='test' />
        </DndProvider>
      )

      fireEvent.keyDown(getByRole('button', { name: /Name/i }), { key: 'ArrowDown', code: 'ArrowDown' })

      expect(mockedUseDraggableKeyNavigation).toHaveBeenCalledWith(onDragEnd, origin, onKeyNav)
      expect(mockHandleKeyDown).toHaveBeenCalledWith(key)
      expect(mockKeyDownHandler).toHaveBeenCalledTimes(1)
      await flush()
    })
  })
})
