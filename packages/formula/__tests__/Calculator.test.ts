/******************************************************
 * Created by nanyuantingfeng on 2019-05-10 16:51.
 *****************************************************/
import { Calculator } from '../src'
import { observable, toJS } from 'mobx'

const datasource: any = require('./source.json')
const formulaO = require('./formula.json')

import { Formula, register } from '../src'

@register('language')
class LanguageFormula extends Formula {
  calculate<T>(data: any[]): Promise<T> {
    return data as any
  }
}

describe('Calculator', () => {
  it('demo:observable', async () => {
    const dataset = observable(datasource)
    const formulas = observable.map(formulaO)
    const calculator = new Calculator(dataset, formulas)

    await calculator.idle(() => dataset)

    expect(toJS(dataset)).toEqual({
      aaa: { label: [[111]], value: [[111]] },
      bbb: { label: '1123xxx', value: [111] },
      'aaa.preset': { value: '1123xxx21' },
      ccc: { label: 21, value: 111 }
    })
  })

  it('demo:observable.map', async () => {
    const dataset = observable.map(datasource)
    const formulas = observable.map(formulaO)
    const calculator = new Calculator(dataset, formulas)

    await calculator.idle(() => dataset)

    expect(toJS(dataset)).toEqual({
      aaa: { label: [[111]], value: [[111]] },
      bbb: { label: '1123xxx', value: [111] },
      ccc: { label: 21, value: 111 },
      'aaa.preset': { value: '1123xxx21' }
    })
  })

  it('demo:string', async () => {
    const dataset = observable.map({ a: { value: 'xxxx' }, b: {} })
    const formulas = observable.map({
      'b.value': {
        type: 'arithmetic',
        formula: 'a.value + 1',
        args: ['a.value']
      }
    })
    const calculator = new Calculator(dataset, formulas)

    await calculator.idle(() => dataset)
    expect(toJS(dataset)).toEqual({ a: { value: 'xxxx' }, b: { value: 'xxxx1' } })
  })

  it('demo:detectArgs', async () => {
    const dataset = observable.map({ a: { value: 'xxxx' }, b: {} })
    const formulas = observable.map({
      'b.value': {
        type: 'arithmetic',
        formula: 'a.value + 1',
        args: ['a.value']
      },
      'a.value': {
        type: 'arithmetic',
        formula: 'a.value + 1',
        args: ['b.value']
      }
    })

    try {
      new Calculator(dataset, formulas)
    } catch (e) {
      expect(e).toMatchSnapshot()
    }
  })

  it('demo:detectArgs:2', async () => {
    const dataset = observable.map({ a: { value: 'xxxx' }, b: {} })
    const formulas = observable.map({
      'b.value': {
        type: 'js',
        formula: 'b.value + 1',
        args: ['b.value']
      }
    })
    try {
      new Calculator(dataset, formulas)
    } catch (e) {
      expect(e).toMatchSnapshot()
    }
  })
})
