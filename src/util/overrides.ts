/**
 * Components of `overrides` that are set, over the default ones. They are returned as they are: a deep merge would
 * copy components that are objects, such as those of `forwardRef` and `memo`, and React would mount them again on
 * each render.
 */
export function getComponents<T>(overrides: T, defaultComponents: T): T {
  const components = { ...defaultComponents }
  if (overrides) {
    Object.keys(overrides).forEach((key) => {
      if (overrides[key] !== undefined) {
        components[key] = overrides[key]
      }
    })
  }
  return components
}
