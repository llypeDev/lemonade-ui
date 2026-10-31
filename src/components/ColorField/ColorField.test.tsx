import { fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { LocaleContext } from '../../i18n'
import ptBR from '../../i18n/locales/pt-BR'

import { ColorField, ColorFieldProps, normalizeHex } from './ColorField'

jest.mock('../../util/string')

const swatches = [
  { value: '#5E7300', label: 'Green' },
  { value: '#0069D0', label: 'Blue' },
  { value: '#F2C94C', label: 'Yellow' },
]

const Controlled = (props: Partial<ColorFieldProps> & { initial?: string }) => {
  const { initial = '#0069D0', onChange, ...rest } = props
  const [color, setColor] = useState(initial)
  return (
    <ColorField
      label='Tag color'
      value={color}
      onChange={(next) => {
        setColor(next)
        onChange && onChange(next)
      }}
      swatches={swatches}
      {...rest}
    />
  )
}

describe('ColorField', () => {
  it('should render correctly', () => {
    const { container } = render(<ColorField label='Tag color' defaultValue='#0069D0' swatches={swatches} />)
    expect(container).toMatchSnapshot()
  })

  it('should normalize hex codes', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC')
    expect(normalizeHex(' 5e7300 ')).toBe('#5E7300')
    expect(normalizeHex('#12345')).toBeNull()
    expect(normalizeHex('green')).toBeNull()
  })

  it('should group the swatches as radio buttons named by their colors', () => {
    const { getByRole } = render(<Controlled />)

    expect(getByRole('group', { name: 'Tag color' })).toBeInTheDocument()
    expect(getByRole('radiogroup', { name: 'Colors' })).toBeInTheDocument()
    expect(getByRole('radio', { name: 'Blue' })).toHaveAttribute('aria-checked', 'true')
    expect(getByRole('radio', { name: 'Blue' })).toHaveAttribute('tabindex', '0')
    expect(getByRole('radio', { name: 'Green' })).toHaveAttribute('tabindex', '-1')
  })

  it('should pick a swatch with a click', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled onChange={onChange} />)

    fireEvent.click(getByRole('radio', { name: 'Yellow' }))
    expect(onChange).toHaveBeenCalledWith('#F2C94C')
    expect(getByRole('radio', { name: 'Yellow' })).toHaveAttribute('aria-checked', 'true')
    expect(getByRole('textbox', { name: 'Hex code' })).toHaveValue('#F2C94C')
  })

  it('should move and pick with the arrow keys, wrapping around', () => {
    const { getByRole } = render(<Controlled />)
    const blue = getByRole('radio', { name: 'Blue' })

    blue.focus()
    fireEvent.keyDown(blue, { key: 'ArrowRight' })
    expect(getByRole('radio', { name: 'Yellow' })).toHaveFocus()
    expect(getByRole('radio', { name: 'Yellow' })).toHaveAttribute('aria-checked', 'true')

    fireEvent.keyDown(getByRole('radio', { name: 'Yellow' }), { key: 'ArrowRight' })
    expect(getByRole('radio', { name: 'Green' })).toHaveFocus()

    fireEvent.keyDown(getByRole('radio', { name: 'Green' }), { key: 'End' })
    expect(getByRole('radio', { name: 'Yellow' })).toHaveAttribute('aria-checked', 'true')
  })

  it('should accept a hex code typed in the field', () => {
    const onChange = jest.fn()
    const { getByRole } = render(<Controlled onChange={onChange} />)
    const hex = getByRole('textbox', { name: 'Hex code' })

    fireEvent.change(hex, { target: { value: '#12' } })
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.change(hex, { target: { value: '#123' } })
    expect(onChange).toHaveBeenLastCalledWith('#112233')
    expect(getByRole('radio', { name: 'Blue' })).toHaveAttribute('aria-checked', 'false')

    fireEvent.blur(hex)
    expect(hex).toHaveValue('#112233')
  })

  it('should say when the code is not a color', () => {
    const { getByRole, getByText, queryByRole } = render(<Controlled />)
    const hex = getByRole('textbox', { name: 'Hex code' })

    fireEvent.change(hex, { target: { value: '#12G' } })
    fireEvent.blur(hex)
    expect(getByText('Enter a color as #RRGGBB, such as #5E7300')).toBeInTheDocument()
    expect(hex).toHaveAttribute('aria-invalid', 'true')

    fireEvent.click(getByRole('radio', { name: 'Green' }))
    expect(queryByRole('alert')).not.toBeInTheDocument()
    expect(hex).toHaveValue('#5E7300')
  })

  it('should pick any color with the picker of the browser', () => {
    const onChange = jest.fn()
    const { getByLabelText } = render(<Controlled onChange={onChange} />)

    fireEvent.change(getByLabelText('Pick another color'), { target: { value: '#ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#FF0000')
  })

  it('should hide the custom color without allowCustom', () => {
    const { queryByRole } = render(<Controlled allowCustom={false} />)
    expect(queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('should take swatches as plain codes', () => {
    const { getByRole } = render(<ColorField label='Color' swatches={['#abc', '#000000']} />)
    expect(getByRole('radio', { name: '#AABBCC' })).toBeInTheDocument()
  })

  it('should use the locale strings', () => {
    const { getByRole } = render(
      <LocaleContext.Provider value={ptBR}>
        <ColorField label='Cor' />
      </LocaleContext.Provider>
    )
    expect(getByRole('radiogroup', { name: 'Cores' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Código hexadecimal' })).toBeInTheDocument()
  })
})
