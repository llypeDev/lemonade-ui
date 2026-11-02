import { format } from '../byte'

describe('byte utils', () => {
  describe('format', () => {
    it('deve retornar 0 Bytes', () => {
      expect(format(0)).toEqual('0 Bytes')
    })
    it('deve formatar sem casas decimais', () => {
      const formated = format(10000000)
      expect(formated).toEqual('10 MB')
    })
    it('deve formatar com 2 casas decimais', () => {
      const formated = format(10230000)
      expect(formated).toEqual('10.23 MB')
    })
    it('deve formatar com 4 casas decimais', () => {
      const formated = format(10235100, 4)
      expect(formated).toEqual('10.2351 MB')
    })
    it('deve passar para a próxima unidade quando o arredondamento chega a 1000', () => {
      expect(format(999999, 0)).toEqual('1 MB')
      expect(format(999999)).toEqual('1 MB')
      expect(format(999990)).toEqual('999.99 KB')
      expect(format(1000000)).toEqual('1 MB')
      expect(format(999, 0)).toEqual('999 Bytes')
    })
    it('deve formatar valores menores que 1 byte e maiores que a última unidade', () => {
      expect(format(0.5)).toEqual('0.5 Bytes')
      expect(format(1e27)).toEqual('1000 YB')
      expect(format(1e30, 0)).toEqual('1000000 YB')
    })
    it('deve formatar valores negativos com o sinal', () => {
      expect(format(-1500)).toEqual('-1.5 KB')
    })
    it('deve retornar vazio para valores que não são números finitos', () => {
      expect(format(NaN)).toEqual('')
      expect(format(undefined)).toEqual('')
      expect(format(Infinity)).toEqual('')
    })
  })
})
