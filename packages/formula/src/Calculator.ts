/******************************************************
 * Created by nanyuantingfeng on 2019-05-07 18:57.
 *****************************************************/
import { Formula } from './Formula'
import { FormulaType, IObject } from './types'
import { observable, ObservableMap, observe, toJS, transaction } from 'mobx'
import invariant from 'invariant'
import { detectArgs, keepValueMerge } from './helpers'

export class Calculator<T> {
  private formulasInstancesMap: IObject<Formula> = {}

  constructor(
    public dataset: ObservableMap<string, T>,
    public formulas?: ObservableMap<string, FormulaType>,
    private extra?: any
  ) {
    formulas ? this.initialize(formulas) : (this.formulas = observable.map())
    this.listenFormulasChange()
  }

  private clean(keys: string[]) {
    keys.forEach((key) => {
      const instance = this.formulasInstancesMap[key]
      // maybe instance has been deleted
      instance && instance.dispose()
      delete this.formulasInstancesMap[key]
      this.formulas!.delete(key)
    })
  }

  setExtra<N>(extra: N) {
    this.extra = extra
  }

  update(data: IObject) {
    transaction(() => keepValueMerge(this.dataset, data))
  }

  updateFormulas(formulas: IObject<FormulaType>) {
    detectArgs(formulas)
    const keys = Object.keys(formulas)
    const existKeys = Object.keys(this.formulasInstancesMap)
    const needCleanKeys = existKeys.filter((key) => keys.indexOf(key) === -1)
    this.clean(needCleanKeys)

    keys.forEach((key) => this.formulas!.set(key, formulas[key]))
    return keys
  }

  private updateOneFormula(key: string, formulaO: FormulaType) {
    this.formulasInstancesMap[key] && this.formulasInstancesMap[key].dispose()
    const formula = Formula.createFormula(formulaO)
    formula.setExtra(this.extra)
    formula.setDataset(this.dataset)
    formula.listen<T>(key)
    this.formulasInstancesMap[key] = formula
  }

  private listenFormulasChange() {
    observe(this.formulas!, (change) => {
      switch (change.type) {
        case 'add':
        case 'update':
          this.updateOneFormula(change.name, toJS(change.object.get(change.name)!))
          break
        case 'delete':
          this.clean([change.name])
          break
      }
    })
  }

  initialize(formulas: ObservableMap<string, FormulaType>) {
    const formulasO = formulas.toJSON()
    const keys = this.updateFormulas(formulasO)

    // `observe` doesn't support fireImmediately=true in combination with ObservableMap
    // so call updateOneFormula at initialize for fix it .
    keys.forEach((key) => this.updateOneFormula(key, formulasO[key]))
  }

  trigger(keys?: string | string[]) {
    if (!keys) {
      keys = Object.keys(this.formulasInstancesMap)
    }

    if (typeof keys === 'string') {
      keys = [keys]
    }

    keys.forEach((key) => {
      const formula = this.formulasInstancesMap[key]
      invariant(formula, `在formulas列表中,没有找到存在的key:${key}`)
      formula.trigger()
    })
  }

  idle<T>(callback?: () => Promise<T> | T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(callback && callback())))
  }
}
