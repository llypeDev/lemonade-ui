import { render } from '@testing-library/react'
import React from 'react'
import { ModalContextProvider } from '../../hooks/useModalContext'
import { createMockModalContext } from '../../test/utils/createMockModalContext'
import { ModalSidebar } from './ModalSidebar'
import { ModalHeader } from './ModalHeader'

const mockContextValue = createMockModalContext({ hasLeftSidebar: true })

it('should render correctly', () => {
  const { container } = render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar position='left'>Content</ModalSidebar>
    </ModalContextProvider>
  )
  expect(container).toMatchSnapshot()
})

it('should accept "style" prop', () => {
  const { container } = render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar position='left' style={{ background: 'red' }}>
        Content
      </ModalSidebar>
    </ModalContextProvider>
  )
  expect(container).toMatchSnapshot()
})

it('should apply border right when side is left', () => {
  const { getByTestId } = render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar position='left' data-testid='sidebar-left-border'>
        Content
      </ModalSidebar>
    </ModalContextProvider>
  )
  const sidebar = getByTestId('sidebar-left-border')
  expect(getComputedStyle(sidebar).borderRight).toBe('1px solid #D3D4DD')
  expect(getComputedStyle(sidebar).borderLeft).toBe('0px')
})

it('should apply border left when side is right', () => {
  const { getByTestId } = render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar position='right' data-testid='sidebar-right-border'>
        Content
      </ModalSidebar>
    </ModalContextProvider>
  )
  const sidebar = getByTestId('sidebar-right-border')
  expect(getComputedStyle(sidebar).borderLeft).toBe('1px solid #D3D4DD')
  expect(getComputedStyle(sidebar).borderRight).toBe('0px')
})

describe('on small screens', () => {
  const media = '(max-width:600px)'
  const renderSidebar = (position: 'left' | 'right', scroll: 'body' | 'full' = 'body') =>
    render(
      <ModalContextProvider value={createMockModalContext({ scroll })}>
        <ModalSidebar position={position}>Content</ModalSidebar>
      </ModalContextProvider>
    ).container.firstElementChild

  it('should go above the body at full width when it is on the left', () => {
    const sidebar = renderSidebar('left')

    expect(sidebar).toHaveStyleRule('width', '300px')
    expect(sidebar).toHaveStyleRule('width', 'auto', { media })
    expect(sidebar).toHaveStyleRule('order', '1', { media })
    expect(sidebar).toHaveStyleRule('border-right', '0', { media })
    expect(sidebar).toHaveStyleRule('border-bottom', '1px solid #D3D4DD', { media })
  })

  it('should go below the body at full width when it is on the right', () => {
    const sidebar = renderSidebar('right')

    expect(sidebar).toHaveStyleRule('width', 'auto', { media })
    expect(sidebar).toHaveStyleRule('order', '3', { media })
    expect(sidebar).toHaveStyleRule('border-left', '0', { media })
    expect(sidebar).toHaveStyleRule('border-top', '1px solid #D3D4DD', { media })
  })

  it('should leave most of the height to the body when only the body scrolls', () => {
    expect(renderSidebar('left')).toHaveStyleRule('max-height', '30vh', { media })
    expect(renderSidebar('left', 'full')).not.toHaveStyleRule('max-height', expect.anything(), { media })
  })
})

it('should call setSectionState when modal has a left sidebar', () => {
  const mockSetSectionState = jest.fn()

  const mockContextValue = createMockModalContext({ setSectionState: mockSetSectionState })

  render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar position='left' />
    </ModalContextProvider>
  )

  expect(mockSetSectionState).toHaveBeenCalledTimes(1)
  expect(mockSetSectionState).toHaveBeenCalledWith('hasLeftSidebar', true)
})

it('should call setSectionState when modal has a right sidebar', () => {
  const mockSetSectionState = jest.fn()

  const mockContextValue = createMockModalContext({ setSectionState: mockSetSectionState })

  render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar position='right' />
    </ModalContextProvider>
  )

  expect(mockSetSectionState).toHaveBeenCalledTimes(1)
  expect(mockSetSectionState).toHaveBeenCalledWith('hasRightSidebar', true)
})

it('should have gridRow 1 when has no header', () => {
  const mockContextValue = createMockModalContext()

  const { getByTestId } = render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar position='left' data-testid='sidebar-grid-row'>
        Sidebar content
      </ModalSidebar>
    </ModalContextProvider>
  )
  const modalBody = getByTestId('sidebar-grid-row')
  expect(modalBody).toHaveStyle('grid-row: 1;')
})

it('should have gridRow 2 when has header', () => {
  const mockContextValue = createMockModalContext({ hasHeader: true })

  const { getByTestId } = render(
    <ModalContextProvider value={mockContextValue}>
      <ModalHeader title='Modal title' />
      <ModalSidebar position='left' data-testid='sidebar-grid-row'>
        Sidebar content
      </ModalSidebar>
    </ModalContextProvider>
  )
  const modalBody = getByTestId('sidebar-grid-row')
  expect(modalBody).toHaveStyle('grid-row: 2;')
})

it('should forward ref to the underlying element', () => {
  const mockContextValue = createMockModalContext()
  const ref = React.createRef<HTMLDivElement>()

  render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar ref={ref} position='left'>
        Sidebar content
      </ModalSidebar>
    </ModalContextProvider>
  )

  expect(ref.current).toBeInstanceOf(HTMLDivElement)
})

it('should allow ref access to DOM methods', () => {
  const mockContextValue = createMockModalContext()
  const ref = React.createRef<HTMLDivElement>()

  render(
    <ModalContextProvider value={mockContextValue}>
      <ModalSidebar ref={ref} position='left'>
        Sidebar content
      </ModalSidebar>
    </ModalContextProvider>
  )

  expect(ref.current?.tagName).toBe('DIV')
  expect(ref.current?.textContent).toBe('Sidebar content')
})
