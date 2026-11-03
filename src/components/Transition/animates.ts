/**
 * Whether overlays animate when they open and close. Without matchMedia, as in server rendering and in tests,
 * nothing animates, so what closes leaves the page at once.
 */
export const animates = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
