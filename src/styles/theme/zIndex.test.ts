import { zIndex, zIndexLevel } from './zIndex'

it('tooltip z-index must exceed the highest modal container level', () => {
  const maxModalContainer = Math.max(...Object.values(zIndexLevel).map((z) => z.modalContainer))
  expect(zIndex.tooltip).toBeGreaterThan(maxModalContainer)
})

it('toasts must show above every modal and below tooltips', () => {
  const maxModalContainer = Math.max(...Object.values(zIndexLevel).map((z) => z.modalContainer))
  expect(zIndex.toast).toBeGreaterThan(maxModalContainer)
  expect(zIndex.toast).toBeLessThan(zIndex.tooltip)
})
