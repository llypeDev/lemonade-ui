import { render } from '@testing-library/react'
import React from 'react'

import { Highlight } from './Highlight'

it('should surround matches with <mark /> component', () => {
  expect(
    render(<Highlight words={['blue car', 'car']} text='The blue car, the blue scarf!' />).container.innerHTML
  ).toEqual('<span>The <mark>blue car</mark>, the blue s<mark>car</mark>f!</span>')
})

it('should ignore empty search words', () => {
  expect(render(<Highlight words={[]} text='The blue car, the blue scarf!' />).container.innerHTML).toEqual(
    '<span>The blue car, the blue scarf!</span>'
  )
})

it('should ignore falsy search words', () => {
  expect(
    render(<Highlight words={['', null, undefined, '  ']} text='The blue car, the blue scarf!' />).container.innerHTML
  ).toEqual('<span>The blue car, the blue scarf!</span>')
})

it('should render the text as text, not as HTML', () => {
  const { container } = render(<Highlight words={['photo']} text='<img src=x onerror="alert(1)"> photo' />)
  expect(container.querySelector('img')).toBeNull()
  expect(container.innerHTML).toEqual('<span>&lt;img src=x onerror="alert(1)"&gt; <mark>photo</mark></span>')
})

it('should search for characters that have a meaning in regular expressions', () => {
  expect(
    render(<Highlight words={['(11)', 'c++']} text='Call (11) 4002-8922 about C++' />).container.innerHTML
  ).toEqual('<span>Call <mark>(11)</mark> 4002-8922 about <mark>C++</mark></span>')
})
