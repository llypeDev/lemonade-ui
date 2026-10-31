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

afterEach(cleanup)

jest.mock('../styles/hooks/useTheme', () => {
  return {
    useTheme: () => createTheme(),
  }
})
