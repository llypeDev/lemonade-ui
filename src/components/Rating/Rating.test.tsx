import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { Rating } from './Rating'

jest.mock('../../util/string')

describe('Rating', () => {
  it('should render correctly', () => {
    const { container } = render(<Rating aria-label='Your rating' defaultValue={3} />)
    expect(container).toMatchSnapshot()
  })

  it('should render a read-only rating correctly', () => {
    const { container } = render(<Rating value={4.5} readOnly />)
    expect(container).toMatchSnapshot()
  })

  it('should be a radio group with a radio for each star', () => {
    const { getByRole, getAllByRole } = render(<Rating aria-label='Your rating' defaultValue={2} />)

    expect(getByRole('radiogroup', { name: 'Your rating' })).toBeInTheDocument()
    expect(getAllByRole('radio')).toHaveLength(5)
    expect(getByRole('radio', { name: '1 star' })).not.toBeChecked()
    expect(getByRole('radio', { name: '2 stars' })).toBeChecked()
  })

  it('should pick a rating', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Rating aria-label='Your rating' onChange={onChange} />)

    fireEvent.click(getByRole('radio', { name: '4 stars' }))
    expect(onChange).toHaveBeenCalledWith(4)
    expect(getByRole('radio', { name: '4 stars' })).toBeChecked()
  })

  it('should clear the rating with allowClear', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Rating aria-label='Your rating' defaultValue={4} allowClear onChange={onChange} />)

    fireEvent.click(getByRole('radio', { name: '4 stars' }))
    expect(onChange).toHaveBeenCalledWith(0)
    expect(getByRole('radio', { name: '4 stars' })).not.toBeChecked()
  })

  it('should not clear the rating without allowClear', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Rating aria-label='Your rating' defaultValue={4} onChange={onChange} />)

    fireEvent.click(getByRole('radio', { name: '4 stars' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should use max stars and the name for forms', () => {
    const { getAllByRole } = render(<Rating aria-label='Score' max={10} name='score' />)
    const radios = getAllByRole('radio')

    expect(radios).toHaveLength(10)
    expect(radios[0]).toHaveAttribute('name', 'score')
    expect(radios[9]).toHaveAttribute('value', '10')
  })

  it('should disable the stars', () => {
    const { getAllByRole } = render(<Rating aria-label='Your rating' disabled />)
    getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled())
  })

  it('should describe a read-only rating as an image', () => {
    const { getByRole, queryAllByRole } = render(<Rating value={4.5} readOnly />)

    expect(getByRole('img', { name: '4.5 of 5 stars' })).toBeInTheDocument()
    expect(queryAllByRole('radio')).toHaveLength(0)
  })

  it('should translate the labels', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <Rating value={1} readOnly max={1} />
        <Rating aria-label='Nota' />
      </LocaleContext.Provider>
    )

    expect(getByRole('img', { name: '1 de 1 estrela' })).toBeInTheDocument()
    expect(getByRole('radio', { name: '3 estrelas' })).toBeInTheDocument()
  })
})
