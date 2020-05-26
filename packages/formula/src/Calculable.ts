/******************************************************
 * Created by nanyuantingfeng on 2019-05-13 15:09.
 *****************************************************/
import { observable, ObservableMap, transaction } from 'mobx'
import { set, get } from 'lodash'
import { FormulaType, IObject } from './types'
import { Calculator } from './Calculator'
import { isRegisteredFormula } from './Formula'

function isNone(obj: any): boolean {
  return obj === null || obj === undefined
}

function isObject(value: any): boolean {
  return value !== null && typeof value === 'object'
}

export interface CalculableOptions {
  primaryKey?: string | ((item?: IObject) => string)
  exclude?: string[]
  parseFormula?: (value: IObject, key?: string) => FormulaType
}

const defaultCalculableOptions: CalculableOptions = {
  primaryKey: 'name',
  exclude: [],
  parseFormula: (v) => v as FormulaType
}

export interface CalculableConstructorOptions {
  source: IObject[] | IObject<IObject>
  options?: CalculableOptions
  dataset?: ObservableMap<string, IObject>
  formulas?: ObservableMap<string, FormulaType>
  extra?: any
}

function getNameUsePK(name: string | Function) {
  return typeof name === 'string' ? (o: any) => o[name] : name
}

export class Calculable {
  calculator: Calculator<IObject>
  options: CalculableOptions
  dataset: ObservableMap<string, IObject>
  formulas: ObservableMap<string, FormulaType>

  constructor(params: CalculableConstructorOptions) {
    const { source, options, dataset, formulas, extra } = params
    this.options = { ...defaultCalculableOptions, ...options }
    const { datasetO, formulaO } = this._parse(source)
    this.formulas = formulas ? formulas.merge(formulaO) : observable.map(formulaO)
    this.dataset = dataset || observable.map(datasetO)

    // 需要更新
    dataset && this.dataset.merge(datasetO)

    this.calculator = new Calculator(this.dataset, this.formulas, extra)
  }

  private _setUndefinedKey(ofm: IObject, datasetO: IObject) {
    transaction(() => {
      Object.keys(ofm).forEach((key) =>
        (ofm[key].args || []).forEach((k: string) => {
          // MAGIC DON`T TOUCH
          // mobx 语法: observale(object)要被观察的key没有不存在
          // mobx 将会被忽略. 此时需要重新初始此key...
          if (get(datasetO, k) === undefined) {
            set(datasetO, k, undefined)
          }
        })
      )

      Object.keys(datasetO).forEach((key) => {
        // MAGIC DON`T TOUCH
        // !!! UP
        if (get(datasetO[key], 'value') === undefined) {
          set(datasetO[key], 'value', undefined)
        }
      })
    })
  }
  private _parse(source: IObject[] | IObject<IObject>) {
    return Array.isArray(source) ? this._parseArray(source) : this._parseObject(source)
  }
  private _parseArray(source: IObject[]) {
    const odm: IObject = {}
    const ofm: IObject = {}
    source.forEach((value) => this._parseItem(getNameUsePK(this.options.primaryKey!)(value), value, odm, ofm))
    this._setUndefinedKey(ofm, odm)
    return { datasetO: odm, formulaO: ofm }
  }
  private _parseObject(source: IObject<IObject>) {
    const odm: IObject = {}
    const ofm: IObject = {}
    const keys = Object.keys(source)
    keys.forEach((key) => this._parseItem(key, source[key], odm, ofm))
    this._setUndefinedKey(ofm, odm)
    return { datasetO: odm, formulaO: ofm }
  }
  private _parseItem(key: string, value: IObject, datasetO: IObject, formulaO: IObject) {
    // 可能出现空值; example : {datatype : { type : 'whitespace'} }}
    if (key === undefined) {
      return
    }

    const kks = Object.keys(value)
    datasetO[key] = {}
    kks.forEach((k) => {
      const v = value[k]
      if (isObject(v) && !!v.type && isRegisteredFormula(v.type)) {
        if (this.options.exclude!.indexOf(k) === -1) {
          const vx = this.options.parseFormula!(v, k)

          if (!isNone(vx)) {
            formulaO[`${key}.${k}`] = vx
            datasetO[key][k] = vx.initialValue
          } else {
            delete formulaO[`${key}.${k}`]
            datasetO[key][k] = undefined
          }
          return
        }

        /*
        datasetO[key][k] = v
        return
        */
      }
      datasetO[key][k] = v
    })
  }

  update(source: IObject[] | IObject<IObject>, extra?: any) {
    const { datasetO, formulaO } = this._parse(source)
    this.updateDataset(datasetO)
    this.calculator.setExtra(extra)
    this.calculator.updateFormulas(formulaO)
  }

  updateDataset(data: IObject<IObject>) {
    this.calculator.update(data)
  }

  updateFormulas(formulaO: IObject, extra?: any) {
    this.calculator.setExtra(extra)
    this.calculator.updateFormulas(formulaO)
  }

  updateFormulasBySource(source: IObject[] | IObject<IObject>, extra?: any) {
    const { formulaO } = this._parse(source)
    this.calculator.setExtra(extra)
    this.calculator.updateFormulas(formulaO)
  }

  idle<T>(callback?: () => Promise<T> | T): Promise<T> {
    return this.calculator.idle(callback)
  }

  trigger(keys?: string | string[]) {
    return this.calculator.trigger(keys)
  }
}
