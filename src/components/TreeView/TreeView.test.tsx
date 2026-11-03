import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { focusRingStates } from '../../test/utils/resolveStyle'

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

  describe('expand and collapse', () => {
    const { matchMedia } = window
    afterEach(() => {
      window.matchMedia = matchMedia
      jest.restoreAllMocks()
    })
    const prefersReducedMotion = (reduce: boolean) => {
      window.matchMedia = ((query: string) => ({ matches: reduce && query.includes('reduce') })) as any
    }
    // The list of children comes right after the row of the node
    const groupOf = (getByRole: any, name: string) => {
      const group = item(getByRole, name).lastElementChild as HTMLElement
      expect(group).toHaveAttribute('role', 'group')
      return group
    }

    it('should slide the children of a node open', () => {
      prefersReducedMotion(false)
      // jsdom has no layout: the children take 32px
      jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(32)
      const { getByRole, getByText } = renderTree()

      fireEvent.click(getByText('Photos'))
      const group = groupOf(getByRole, 'Photos')
      expect(item(getByRole, 'Beach.png')).toBeInTheDocument()
      expect(group.style.height).toBe('32px')
      expect(group.style.transition).toBe('height 200ms ease')

      fireEvent.transitionEnd(group)
      expect(group.style.height).toBe('')
    })

    it('should keep the children shown while the node collapses, out of the keyboard, and remove them at the end', () => {
      prefersReducedMotion(false)
      const { getByRole, queryByRole } = renderTree({ defaultExpanded: ['docs'] })
      const docs = item(getByRole, 'Documents')
      const group = groupOf(getByRole, 'Documents')

      docs.focus()
      fireEvent.keyDown(docs, { key: 'ArrowLeft' })
      expect(docs).toHaveAttribute('aria-expanded', 'false')
      expect(group).toBeInTheDocument()
      expect(group.style.height).toBe('0px')
      // The children on their way out are not stops of the keyboard
      expect(item(getByRole, 'Contract.pdf')).toHaveAttribute('tabindex', '-1')
      fireEvent.keyDown(docs, { key: 'ArrowDown' })
      expect(item(getByRole, 'Photos')).toHaveFocus()

      fireEvent.transitionEnd(group)
      expect(group).not.toBeInTheDocument()
      expect(queryByRole('treeitem', { name: 'Contract.pdf' })).toBeNull()
      expect(docs.querySelector('[role="group"]')).toBeNull()
    })

    it('should let an open node grow while a child slides open, each with its own slide', () => {
      prefersReducedMotion(false)
      jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(64)
      const { getByRole, getByText } = renderTree()

      fireEvent.click(getByText('Documents'))
      const docs = groupOf(getByRole, 'Documents')
      expect(docs.style.height).toBe('64px')
      fireEvent.transitionEnd(docs)
      expect(docs.style.height).toBe('')

      // The open parent has no fixed height, so it grows with the child and pushes the nodes below
      fireEvent.click(getByText('Invoices'))
      const invoices = groupOf(getByRole, 'Invoices')
      expect(invoices.style.height).toBe('64px')
      expect(docs.style.height).toBe('')

      // The end of the slide of the child bubbles up, and does not end the slide of the parent
      fireEvent.click(getByText('Documents'))
      expect(docs.style.height).toBe('0px')
      fireEvent.transitionEnd(invoices)
      expect(docs.style.height).toBe('0px')
      expect(docs).toBeInTheDocument()

      fireEvent.transitionEnd(docs)
      expect(docs).not.toBeInTheDocument()
    })

    it('should make room in a node still sliding open for a child that opens or closes', () => {
      prefersReducedMotion(false)
      // The parent takes 64px, and the children of Invoices 64px more
      jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(64)
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        return { height: this.style.height ? parseFloat(this.style.height) : 64 } as DOMRect
      })
      const { getByRole, getByText } = renderTree()

      fireEvent.click(getByText('Documents'))
      const docs = groupOf(getByRole, 'Documents')
      expect(docs.style.height).toBe('64px')

      // The parent ends at its height with the open child, instead of jumping to it at the end
      fireEvent.click(getByText('Invoices'))
      expect(groupOf(getByRole, 'Invoices').style.height).toBe('64px')
      expect(docs.style.height).toBe('128px')

      fireEvent.click(getByText('Invoices'))
      const invoices = groupOf(getByRole, 'Invoices')
      expect(invoices.style.height).toBe('0px')
      expect(docs.style.height).toBe('64px')

      fireEvent.transitionEnd(invoices)
      fireEvent.transitionEnd(docs)
      expect(docs.style.height).toBe('')
    })

    it('should open a node with its open children in one slide', () => {
      prefersReducedMotion(false)
      jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(96)
      const { getByRole, getByText } = renderTree({ defaultExpanded: ['invoices'] })

      fireEvent.click(getByText('Documents'))
      expect(groupOf(getByRole, 'Documents').style.height).toBe('96px')
      expect(item(getByRole, 'October.pdf')).toBeInTheDocument()
      expect(groupOf(getByRole, 'Invoices').style.height).toBe('')
      fireEvent.transitionEnd(groupOf(getByRole, 'Documents'))
    })

    it('should remove the children at once with reduced motion', () => {
      prefersReducedMotion(true)
      const { getByRole, getByText, queryByRole } = renderTree({ defaultExpanded: ['docs'] })

      fireEvent.click(getByText('Documents'))
      expect(queryByRole('treeitem', { name: 'Contract.pdf' })).toBeNull()
      expect(item(getByRole, 'Documents').querySelector('[role="group"]')).toBeNull()
    })
  })
})

it('should show the focus ring of a node for the keyboard, not after a click', () => {
  const { getByRole } = renderTree({ defaultSelected: 'photos' })

  ;[item(getByRole, 'Documents'), item(getByRole, 'Photos')].forEach((node) => {
    const { received, expected } = focusRingStates(node.firstElementChild, { on: node })
    expect(received).toEqual(expected)
  })
})
