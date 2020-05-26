/******************************************************
 * Created by nanyuantingfeng on 2019-05-17 12:42.
 *****************************************************/
import { observable, toJS } from 'mobx'
import { getAt, setAt } from '../src'

describe('helpers', () => {
  describe('getAt', () => {
    it('should getAt.0', () => {
      const aa = observable.map()
      expect(getAt(aa, 'a')).toEqual(undefined)
    })

    it('should getAt.1', () => {
      const aa = observable.map({ a: {} })
      expect(getAt(aa, 'a.a')).toEqual(undefined)
    })
  })

  describe('setAt', () => {
    it('should setAt.0', () => {
      const aa = observable.map()
      setAt(aa, 'a', { 1: 2 })
      expect(toJS(aa)).toEqual({ a: { '1': 2 } })
    })

    it('should setAt.1', () => {
      const aa = observable.map()
      setAt(aa, 'a.a', { 1: 2 })
      expect(toJS(aa)).toEqual({ a: { a: { '1': 2 } } })
    })
  })
})
