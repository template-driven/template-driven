/******************************************************
 * Created by nanyuantingfeng on 2019-05-13 15:04.
 *****************************************************/
import { Calculable } from '../src'
import { get, observable, set, toJS } from 'mobx'
import '../src/formula-impls/ArithmeticFormula'
import { IObject } from '../src'

describe('Calculable::Array', () => {
  const source: any = require('./source-a.json')
  it('demo', async () => {
    const calculableArray = new Calculable({
      source,
      options: { primaryKey: (item) => item.name }
    })
    const dataset = await calculableArray.idle(() => calculableArray.dataset)
    set(get(dataset, 'ccc'), 'value', 999)
    await calculableArray.idle()

    expect(toJS(dataset)).toEqual({
      aaa: {
        label: 'AAA',
        name: 'aaa',
        preset: [1009, 999, 1, 2],
        value: 9081,
        other: {
          a: [1, 2, 3, 4],
          k: false,
          x: 'data'
        }
      },
      bbb: { label: 'CCCC<BBB>', name: 'bbb', value: 1009 },
      ccc: { label: 'CCCC', name: 'ccc', value: 999 }
    })
  })

  it('demo:exclude', async () => {
    const calculable = new Calculable({
      source,
      options: {
        primaryKey: (item) => item.name,
        exclude: ['preset']
      }
    })
    const dataset = await calculable.idle(() => calculable.dataset)
    set(get(dataset, 'ccc'), 'value', 999)
    await calculable.idle()

    expect(toJS(dataset)).toEqual({
      aaa: {
        label: 'AAA',
        name: 'aaa',
        other: {
          a: [1, 2, 3, 4],
          k: false,
          x: 'data'
        },
        preset: { args: ['bbb.value', 'ccc.value'], formula: '[bbb.value, ccc.value, 1,2]', type: 'arithmetic' },
        value: 9081
      },
      bbb: { label: 'CCCC<BBB>', name: 'bbb', value: 1009 },
      ccc: { label: 'CCCC', name: 'ccc', value: 999 }
    })
  })

  it('demo:exclude:outside:dataset', async () => {
    const dataset = observable.map({})

    const calculable = new Calculable({
      source,
      options: {
        primaryKey: (item) => item.name,
        exclude: ['preset']
      },
      dataset
    })

    await calculable.idle(() => calculable.dataset)
    set(get(dataset, 'ccc'), 'value', 999)
    await calculable.idle()

    expect(toJS(dataset)).toEqual({
      aaa: {
        label: 'AAA',
        name: 'aaa',
        other: {
          a: [1, 2, 3, 4],
          k: false,
          x: 'data'
        },
        preset: { args: ['bbb.value', 'ccc.value'], formula: '[bbb.value, ccc.value, 1,2]', type: 'arithmetic' },
        value: 9081
      },
      bbb: { label: 'CCCC<BBB>', name: 'bbb', value: 1009 },
      ccc: { label: 'CCCC', name: 'ccc', value: 999 }
    })
  })
})

describe('Calculable::Object', () => {
  const source: IObject<IObject> = require('./source-o.json')
  it('demo', async () => {
    const calculableArray = new Calculable({ source })
    const dataset = await calculableArray.idle(() => calculableArray.dataset)
    set(get(dataset, 'ccc'), 'value', 999)
    await calculableArray.idle()

    expect(toJS(dataset)).toEqual({
      aaa: {
        label: 'AAA',
        preset: [1009, 999, 1, 2],
        value: 9081,
        other: {
          a: [1, 2, 3, 4],
          k: false,
          x: 'data'
        }
      },
      bbb: { label: 'CCCC<BBB>', value: 1009 },
      ccc: { label: 'CCCC', value: 999 }
    })
  })

  it('demo:exclude', async () => {
    const calculable = new Calculable({ source, options: { exclude: ['preset'] } })
    const dataset = await calculable.idle(() => calculable.dataset)
    set(get(dataset, 'ccc'), 'value', 999)
    await calculable.idle()

    expect(toJS(dataset)).toEqual({
      aaa: {
        label: 'AAA',
        other: {
          a: [1, 2, 3, 4],
          k: false,
          x: 'data'
        },
        preset: { args: ['bbb.value', 'ccc.value'], formula: '[bbb.value, ccc.value, 1,2]', type: 'arithmetic' },
        value: 9081
      },
      bbb: { label: 'CCCC<BBB>', value: 1009 },
      ccc: { label: 'CCCC', value: 999 }
    })
  })

  it('demo:exclude:outside:dataset', async () => {
    const dataset = observable.map({})

    const calculable = new Calculable({ source, options: { exclude: ['preset'] }, dataset })
    await calculable.idle(() => calculable.dataset)
    set(get(dataset, 'ccc'), 'value', 999)
    await calculable.idle()

    expect(toJS(dataset)).toEqual({
      aaa: {
        label: 'AAA',
        other: {
          a: [1, 2, 3, 4],
          k: false,
          x: 'data'
        },
        preset: { args: ['bbb.value', 'ccc.value'], formula: '[bbb.value, ccc.value, 1,2]', type: 'arithmetic' },
        value: 9081
      },
      bbb: { label: 'CCCC<BBB>', value: 1009 },
      ccc: { label: 'CCCC', value: 999 }
    })
  })
})
