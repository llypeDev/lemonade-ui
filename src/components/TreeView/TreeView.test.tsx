import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { TreeNode, TreeView } from './TreeView'

jest.mock('../../util/string')

const items: TreeNode[] = [
  {
    id: 'docs',
    label: 'Documents',
    icon: 'folderOutline',
    children: [
      { id: 'contract', label: 'Contract.pdf' },
      { id: 'invoices', label: 'Invoices', children: [{ id: 'oct', label: 'October.pdf' }] },
    ],
  },
  { id: 'photos', label: 'Photos', children: [{ id: 'beach', label: 'Beach.png' }] },
  { id: 'notes', label: 'Notes.txt', disabled: true },
]

const renderTree = (props: Partial<React.ComponentProps<typeof TreeView>> = {}) =>
  render(<TreeView aria-label='Files' items={items} {...props} />)

const item = (getByRole: any, name: string) => getByRole('treeitem', { name })

describe('TreeView', () => {
  it('should render correctly', () => {
    const { container } = renderTree({ defaultExpanded: ['docs'], defaultSelected: 'contract' })
    expect(container).toMatchSnapshot()
  })

  it('should be a tree with levels, sizes and positions', () => {
    const { getByRole } = renderTree({ defaultExpanded: ['docs'] })
    const docs = item(getByRole, 'Documents')
    const contract = item(getByRole, 'Contract.pdf')

    expect(getByRole('tree', { name: 'Files' })).toBeInTheDocument()
    expect(docs).toHaveAttribute('aria-level', '1')
    expect(docs).toHaveAttribute('aria-expanded', 'true')
    expect(docs).toHaveAttribute('aria-setsize', '3')
    expect(contract).toHaveAttribute('aria-level', '2')
    expect(contract).toHaveAttribute('aria-posinset', '1')
    expect(contract).not.toHaveAttribute('aria-expanded')
    expect(item(getByRole, 'Photos')).toHaveAttribute('aria-expanded', 'false')
  })

  it('should keep only one node in the tab order', () => {
    const { getAllByRole } = renderTree({ defaultExpanded: ['docs'] })
    const tabbable = getAllByRole('treeitem').filter((node) => node.getAttribute('tabindex') === '0')

    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toHaveAttribute('data-id', 'docs')
  })

  it('should move, expand and collapse with the arrow keys', () => {
    const onExpandedChange = jest.fn()
    const { getByRole, queryByRole } = renderTree({ onExpandedChange })
    const docs = item(getByRole, 'Documents')

    docs.focus()
    fireEvent.keyDown(docs, { key: 'ArrowRight' })
    expect(onExpandedChange).toHaveBeenLastCalledWith(['docs'])
    expect(docs).toHaveAttribute('aria-expanded', 'true')
    expect(docs).toHaveFocus()

    fireEvent.keyDown(docs, { key: 'ArrowRight' })
    expect(item(getByRole, 'Contract.pdf')).toHaveFocus()

    fireEvent.keyDown(item(getByRole, 'Contract.pdf'), { key: 'ArrowDown' })
    expect(item(getByRole, 'Invoices')).toHaveFocus()
    expect(item(getByRole, 'Invoices')).toHaveAttribute('tabindex', '0')

    fireEvent.keyDown(item(getByRole, 'Invoices'), { key: 'ArrowLeft' })
    expect(docs).toHaveFocus()

    fireEvent.keyDown(docs, { key: 'ArrowLeft' })
    expect(docs).toHaveAttribute('aria-expanded', 'false')
    expect(queryByRole('treeitem', { name: 'Contract.pdf' })).toBeNull()
  })

  it('should go to the first and last nodes with Home and End', () => {
    const { getByRole } = renderTree({ defaultExpanded: ['docs'] })
    const docs = item(getByRole, 'Documents')

    docs.focus()
    fireEvent.keyDown(docs, { key: 'End' })
    expect(item(getByRole, 'Notes.txt')).toHaveFocus()

    fireEvent.keyDown(item(getByRole, 'Notes.txt'), { key: 'Home' })
    expect(docs).toHaveFocus()
  })

  it('should jump to a node by typing its first letter', () => {
    const { getByRole } = renderTree()
    const docs = item(getByRole, 'Documents')

    docs.focus()
    fireEvent.keyDown(docs, { key: 'n' })
    expect(item(getByRole, 'Notes.txt')).toHaveFocus()

    fireEvent.keyDown(item(getByRole, 'Notes.txt'), { key: 'd' })
    expect(docs).toHaveFocus()
  })

  it('should select a node with a click, Enter or Space', () => {
    const onSelectedChange = jest.fn()
    const { getByRole, getByText } = renderTree({ defaultExpanded: ['docs'], onSelectedChange })

    fireEvent.click(getByText('Contract.pdf'))
    expect(onSelectedChange).toHaveBeenLastCalledWith('contract', items[0].children[0])
    expect(item(getByRole, 'Contract.pdf')).toHaveAttribute('aria-selected', 'true')
    expect(item(getByRole, 'Documents')).toHaveAttribute('aria-selected', 'false')

    const photos = item(getByRole, 'Photos')
    photos.focus()
    fireEvent.keyDown(photos, { key: 'Enter' })
    expect(onSelectedChange).toHaveBeenLastCalledWith('photos', items[1])
    expect(photos).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(photos, { key: ' ' })
    expect(photos).toHaveAttribute('aria-expanded', 'false')
  })

  it('should not select a disabled node', () => {
    const onSelectedChange = jest.fn()
    const { getByRole, getByText } = renderTree({ onSelectedChange })

    fireEvent.click(getByText('Notes.txt'))
    expect(onSelectedChange).not.toHaveBeenCalled()
    expect(item(getByRole, 'Notes.txt')).toHaveAttribute('aria-disabled', 'true')
  })

  it('should follow the expanded and selected props of a controlled tree', () => {
    const onExpandedChange = jest.fn()
    const { getByRole, getByText, rerender } = renderTree({ expanded: [], selected: null, onExpandedChange })

    fireEvent.click(getByText('Photos'))
    expect(onExpandedChange).toHaveBeenCalledWith(['photos'])
    expect(item(getByRole, 'Photos')).toHaveAttribute('aria-expanded', 'false')
    expect(item(getByRole, 'Photos')).toHaveAttribute('aria-selected', 'false')

    rerender(<TreeView aria-label='Files' items={items} expanded={['photos']} selected='beach' />)
    expect(item(getByRole, 'Beach.png')).toHaveAttribute('aria-selected', 'true')
    expect(item(getByRole, 'Beach.png')).toHaveAttribute('tabindex', '0')
  })
})
