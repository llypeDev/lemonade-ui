import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { ErrorSummary } from './ErrorSummary'

jest.mock('../../util/string')

const errors = [
  { fieldId: 'email', message: 'Enter your email address' },
  { fieldId: 'phone', message: 'Enter a phone number with the area code' },
]

describe('ErrorSummary', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ErrorSummary errors={errors} description='Check the fields below before you continue.' />
    )
    expect(container).toMatchSnapshot()
  })

  it('should show the title and a link for each error', () => {
    const { getByRole } = render(<ErrorSummary errors={errors} />)

    expect(getByRole('alert', { name: 'There is a problem' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'There is a problem' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Enter your email address' })).toHaveAttribute('href', '#email')
    expect(getByRole('link', { name: 'Enter a phone number with the area code' })).toHaveAttribute('href', '#phone')
  })

  it('should take the focus when it appears', () => {
    const { getByRole } = render(<ErrorSummary errors={errors} />)
    expect(getByRole('alert')).toHaveFocus()
  })

  it('should not take the focus without autoFocus', () => {
    const { getByRole } = render(<ErrorSummary errors={errors} autoFocus={false} />)
    expect(getByRole('alert')).not.toHaveFocus()
  })

  it('should take the focus again when focusKey changes', () => {
    const { getByRole, rerender } = render(
      <>
        <ErrorSummary errors={errors} focusKey={1} />
        <input aria-label='Name' />
      </>
    )

    getByRole('textbox', { name: 'Name' }).focus()
    rerender(
      <>
        <ErrorSummary errors={errors} focusKey={2} />
        <input aria-label='Name' />
      </>
    )
    expect(getByRole('alert')).toHaveFocus()
  })

  it('should move the focus to the field of a link', () => {
    const { getByRole, getByLabelText } = render(
      <>
        <ErrorSummary errors={errors} />
        <label htmlFor='email'>Email</label>
        <input id='email' />
      </>
    )

    const click = fireEvent.click(getByRole('link', { name: 'Enter your email address' }))
    expect(click).toBe(false)
    expect(getByLabelText('Email')).toHaveFocus()
  })

  it('should move the focus to the first field of a group', () => {
    const { getByRole } = render(
      <>
        <ErrorSummary errors={[{ fieldId: 'plan', message: 'Choose a plan' }]} />
        <fieldset id='plan'>
          <legend>Plan</legend>
          <input type='radio' name='plan' aria-label='Basic' />
          <input type='radio' name='plan' aria-label='Pro' />
        </fieldset>
      </>
    )

    fireEvent.click(getByRole('link', { name: 'Choose a plan' }))
    expect(getByRole('radio', { name: 'Basic' })).toHaveFocus()
  })

  describe('scroll', () => {
    const rects = new Map<string, number>()
    const scrolled: Element[] = []
    const { scrollIntoView } = Element.prototype

    beforeEach(() => {
      rects.clear()
      scrolled.length = 0
      Element.prototype.scrollIntoView = function (this: Element) {
        scrolled.push(this)
      }
      jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const top = rects.get(this.id || this.tagName) ?? 0
        return { top, bottom: top + 40, height: 40 } as DOMRect
      })
    })

    afterEach(() => {
      Element.prototype.scrollIntoView = scrollIntoView
      jest.restoreAllMocks()
    })

    const renderForm = () =>
      render(
        <>
          <ErrorSummary errors={[{ fieldId: 'city', message: 'Enter the city' }]} />
          <fieldset>
            <legend>Address</legend>
            <label htmlFor='city'>City</label>
            <input id='city' />
          </fieldset>
        </>
      )

    it('should scroll the legend of the group when the field also fits in the window', () => {
      rects.set('LEGEND', 0).set('city', 300)
      const { getByRole, getByText } = renderForm()

      fireEvent.click(getByRole('link', { name: 'Enter the city' }))
      expect(scrolled).toEqual([getByText('Address')])
      expect(getByRole('textbox', { name: 'City' })).toHaveFocus()
    })

    it('should scroll the label when the legend is too far above the field', () => {
      rects.set('LEGEND', 0).set('city', window.innerHeight * 3)
      const { getByRole, getByText } = renderForm()

      fireEvent.click(getByRole('link', { name: 'Enter the city' }))
      expect(scrolled).toEqual([getByText('City')])
      expect(getByRole('textbox', { name: 'City' })).toHaveFocus()
    })
  })

  it('should show errors without a field as text', () => {
    const { getByText, queryByRole } = render(
      <ErrorSummary errors={[{ message: 'The server did not answer. Try again.' }]} />
    )
    expect(getByText('The server did not answer. Try again.')).toBeInTheDocument()
    expect(queryByRole('link')).not.toBeInTheDocument()
  })

  it('should render nothing without errors', () => {
    const { container } = render(<ErrorSummary errors={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should appear and take the focus after a submit with errors', () => {
    const Form = () => {
      const [submitted, setSubmitted] = useState(0)
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted((count) => count + 1)
          }}
        >
          {submitted > 0 && <ErrorSummary errors={errors} focusKey={submitted} />}
          <button type='submit'>Send</button>
        </form>
      )
    }
    const { getByRole } = render(<Form />)

    fireEvent.click(getByRole('button', { name: 'Send' }))
    expect(getByRole('alert')).toHaveFocus()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <ErrorSummary errors={errors} />
      </LocaleContext.Provider>
    )
    expect(getByRole('heading', { name: 'Há um problema' })).toBeInTheDocument()
  })
})
