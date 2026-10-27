import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { Accordion } from './Accordion'
import { AccordionItem } from './AccordionItem'

jest.mock('../../util/string')

const renderAccordion = () =>
  render(
    <Accordion>
      <AccordionItem title='First'>First content</AccordionItem>
      <AccordionItem title='Second' defaultExpanded>
        Second content
      </AccordionItem>
      <AccordionItem title='Disabled' disabled>
        Disabled content
      </AccordionItem>
      <AccordionItem title='Third'>Third content</AccordionItem>
    </Accordion>
  )

describe('Accordion', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem title='Title'>Content</AccordionItem>
      </Accordion>
    )
    expect(container).toMatchSnapshot()
  })

  it('should link each header to its content', () => {
    const { getByRole, getByText } = render(<AccordionItem title='Second'>Second content</AccordionItem>)
    const header = getByRole('button', { name: 'Second' })
    const content = getByText('Second content')

    expect(header).toHaveAttribute('aria-controls', content.id)
    expect(content).toHaveAttribute('role', 'region')
    expect(content).toHaveAttribute('aria-labelledby', header.id)
  })

  it('should wrap the header in a heading of the given level', () => {
    const { container } = render(
      <AccordionItem title='Title' headingLevel={4}>
        Content
      </AccordionItem>
    )
    expect(container.querySelector('h4')).toHaveTextContent('Title')
  })

  it('should start collapsed unless defaultExpanded is set', () => {
    const { getByRole, getByText } = renderAccordion()

    expect(getByRole('button', { name: 'First' })).toHaveAttribute('aria-expanded', 'false')
    expect(getByText('First content')).not.toBeVisible()
    expect(getByRole('button', { name: 'Second' })).toHaveAttribute('aria-expanded', 'true')
    expect(getByText('Second content')).toBeVisible()
  })

  it('should expand and collapse an item when its header is clicked', () => {
    const { getByRole, getByText } = renderAccordion()
    const header = getByRole('button', { name: 'First' })

    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(getByText('First content')).toBeVisible()

    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(getByText('First content')).not.toBeVisible()
  })

  it('should not toggle a disabled item', () => {
    const { getByRole, getByText } = renderAccordion()
    const header = getByRole('button', { name: 'Disabled' })

    expect(header).toBeDisabled()
    fireEvent.click(header)
    expect(getByText('Disabled content')).not.toBeVisible()
  })

  it('should be controllable', () => {
    const onChange = jest.fn()
    const { getByRole, getByText, rerender } = render(
      <AccordionItem title='Title' expanded={false} onChange={onChange}>
        Content
      </AccordionItem>
    )

    fireEvent.click(getByRole('button', { name: 'Title' }))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(getByText('Content')).not.toBeVisible()

    rerender(
      <AccordionItem title='Title' expanded onChange={onChange}>
        Content
      </AccordionItem>
    )
    expect(getByText('Content')).toBeVisible()
  })

  it('should move focus between headers with the arrow keys, Home and End, skipping disabled ones', () => {
    const { getByRole } = renderAccordion()
    const first = getByRole('button', { name: 'First' })
    const second = getByRole('button', { name: 'Second' })
    const third = getByRole('button', { name: 'Third' })

    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    expect(second).toHaveFocus()

    fireEvent.keyDown(second, { key: 'ArrowDown' })
    expect(third).toHaveFocus()

    fireEvent.keyDown(third, { key: 'ArrowDown' })
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'ArrowUp' })
    expect(third).toHaveFocus()

    fireEvent.keyDown(third, { key: 'Home' })
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'End' })
    expect(third).toHaveFocus()
  })
})
