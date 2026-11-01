import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { createSerializer, matchers } from 'jest-emotion'

import { createTheme } from '../styles/theme/createTheme'

expect.extend(matchers)

expect.addSnapshotSerializer(createSerializer())

// Polyfill for test context
const { RelativeTimeFormat } = Intl
// @ts-ignore
global.Intl = require('intl')
// The polyfill has no RelativeTimeFormat, so the one from Node stays
// @ts-ignore
global.Intl.RelativeTimeFormat = RelativeTimeFormat

// jsdom does not compute pseudo-elements: it logs an error and returns the element's own style,
// so the pseudo-element is dropped to keep the same result without the noise
const { getComputedStyle } = window
window.getComputedStyle = (element: Element) => getComputedStyle.call(window, element)

afterEach(cleanup)

jest.mock('../styles/hooks/useTheme', () => {
  return {
    useTheme: () => createTheme(),
  }
})
