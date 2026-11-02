import { useTheme } from '../styles'
import { Breakpoint } from '../styles/theme/createBreakpoints'

import { useWindowSize } from './useWindowSize'

/**
 * Current applied breakpoint, based on window's width.
 *
 * Note: it returns `null` on first render, as on the server, where the `window` object is not defined.
 */
export function useBreakpoint(): Breakpoint | null {
  const theme = useTheme()
  const dimensions = useWindowSize()

  if (!dimensions) {
    return null
  }

  // Each breakpoint starts at its width, as `theme.breakpoints.up()`, which is `min-width`
  const sizes: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs']
  const current = sizes.find((key) => dimensions.innerWidth >= theme.breakpoints.size[key])
  return current
}
