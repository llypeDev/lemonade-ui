import * as Lemonade from './'

it('should export components to global namespace', () => {
  expect(Object.keys(Lemonade)).toMatchSnapshot()
})
